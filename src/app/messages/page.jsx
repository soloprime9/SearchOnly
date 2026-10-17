"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import {
  Send,
  Search,
  Users,
  User,
  ShieldCheck,
  Check,
  CheckCheck,
  Smile,
  Reply,
  X,
  Plus,
  Pin,
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Lock,
  Globe,
  Radio,
  Pencil,
  Trash2,
  Settings,
  Shield,
  Crown,
  UserPlus,
  UserMinus,
  LogOut,
  Ban,
  Info,
} from "lucide-react";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import {
  getConversationCryptoKey,
  encryptChatMessage,
  decryptChatMessage,
} from "@/utils/cryptoChat";
import { playPop, playChime, playTap } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";

const API_BASE = getApiBase();

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const directTargetUserId = searchParams.get("user") || searchParams.get("userId");

  // Auth & Identity State
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Conversations State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'direct' | 'groups'
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);

  // Messages State
  const [messages, setMessages] = useState([]);
  const [decryptedTextMap, setDecryptedTextMap] = useState({});
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // userId -> username

  // Edit Message State
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Modals State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [groupSelectedUserIds, setGroupSelectedUserIds] = useState([]);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Group Settings & Admin Modal State
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDesc, setEditGroupDesc] = useState("");
  const [onlyAdminsCanMessageState, setOnlyAdminsCanMessageState] = useState(false);
  const [onlyAdminsCanEditInfoState, setOnlyAdminsCanEditInfoState] = useState(true);
  const [isSavingGroupSettings, setIsSavingGroupSettings] = useState(false);
  const [addMemberQuery, setAddMemberQuery] = useState("");
  const [addMemberResults, setAddMemberResults] = useState([]);
  const [searchingAddMember, setSearchingAddMember] = useState(false);

  // Reaction popover on hover
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // 1. Initialize Auth on Mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setCurrentUser({
          id: decoded.UserId,
          username: decoded.username || "Me",
          name: decoded.name || decoded.username || "Me",
        });
        setAuthToken(token);
      }
    } catch (err) {
      console.error("Token decode error:", err);
    }
  }, []);

  // 2. Initialize Socket.IO connection
  useEffect(() => {
    if (!currentUser?.id) return;

    const socket = io(API_BASE, {
      transports: ["websocket", "polling"],
      auth: { token: authToken },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_user", currentUser.id);
    });

    // Handle new incoming message
    socket.on("new_message", async (newMsg) => {
      if (activeConversation && newMsg.conversationId === activeConversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

        // Decrypt incoming message
        const key = await getConversationCryptoKey(newMsg.conversationId);
        if (key && newMsg.encryptedText && newMsg.iv) {
          const plain = await decryptChatMessage(newMsg.encryptedText, newMsg.iv, key);
          setDecryptedTextMap((prev) => ({ ...prev, [newMsg._id]: plain }));
        }

        if (newMsg.sender?._id !== currentUser.id) {
          playChime();
        }
      }

      // Update sidebar conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === newMsg.conversationId
            ? {
                ...c,
                lastMessage: {
                  text: newMsg.encryptedText ? newMsg.encryptedText.slice(0, 30) : "Message",
                  createdAt: newMsg.createdAt,
                  sender: newMsg.sender,
                },
                updatedAt: new Date().toISOString(),
                unreadCount:
                  c._id === activeConversation?._id || newMsg.sender?._id === currentUser.id
                    ? 0
                    : (c.unreadCount || 0) + 1,
              }
            : c
        )
      );
    });

    // Handle message edited
    socket.on("message_edited", async ({ messageId, encryptedText, iv, isEdited, editedAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, encryptedText, iv, isEdited, editedAt } : m
        )
      );
      if (activeConversation) {
        const key = await getConversationCryptoKey(activeConversation._id);
        if (key && encryptedText && iv) {
          const plain = await decryptChatMessage(encryptedText, iv, key);
          setDecryptedTextMap((prev) => ({ ...prev, [messageId]: plain }));
        }
      }
    });

    // Handle message deleted
    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, encryptedText: "", linkPreview: undefined, reactions: [] }
            : m
        )
      );
      setDecryptedTextMap((prev) => ({ ...prev, [messageId]: "This message was deleted" }));
    });

    // Handle group settings & member updates
    socket.on("group_settings_updated", (updatedConv) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === updatedConv._id ? { ...c, ...updatedConv } : c))
      );
      if (activeConversation && activeConversation._id === updatedConv._id) {
        setActiveConversation((prev) => ({ ...prev, ...updatedConv }));
      }
    });

    // Handle being removed from group
    socket.on("group_removed", ({ conversationId }) => {
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      if (activeConversation && activeConversation._id === conversationId) {
        setActiveConversation(null);
        toast.info("You were removed from this group");
      }
    });

    // Handle typing status
    socket.on("user_typing", ({ conversationId, userId, username, isTyping }) => {
      if (activeConversation && conversationId === activeConversation._id && userId !== currentUser.id) {
        setTypingUsers((prev) => {
          if (isTyping) {
            return { ...prev, [userId]: username };
          } else {
            const next = { ...prev };
            delete next[userId];
            return next;
          }
        });
      }
    });

    // Handle message reaction updates
    socket.on("message_reaction", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    });

    // Handle messages read status
    socket.on("messages_read", ({ conversationId, readByUserId }) => {
      if (activeConversation && conversationId === activeConversation._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.readBy?.includes(readByUserId)
              ? m
              : { ...m, readBy: [...(m.readBy || []), readByUserId] }
          )
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, activeConversation, authToken]);

  // 3. Load Conversations
  const fetchConversations = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoadingChats(true);
      const res = await axios.get(`${API_BASE}/chat/conversations`, {
        headers: getAuthHeaders(),
      });
      if (res.data?.success) {
        setConversations(res.data.conversations || []);

        if (directTargetUserId && !activeConversation) {
          initiateDirectChat(directTargetUserId);
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoadingChats(false);
    }
  }, [authToken, directTargetUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 4. Initiate 1-on-1 Chat with a user
  const initiateDirectChat = async (targetUserId) => {
    if (!authToken || !targetUserId) return;
    try {
      const res = await axios.post(
        `${API_BASE}/chat/conversation`,
        { targetUserId },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success && res.data.conversation) {
        const conv = res.data.conversation;
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === conv._id);
          return exists ? prev : [conv, ...prev];
        });
        selectConversation(conv);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not open chat");
    }
  };

  // 5. Select a conversation
  const selectConversation = async (conv) => {
    if (activeConversation?._id) {
      socketRef.current?.emit("leave_conversation", activeConversation._id);
    }

    setActiveConversation(conv);
    playTap();
    socketRef.current?.emit("join_conversation", conv._id);

    // Reset editing state
    setEditingMessageId(null);
    setEditingText("");

    // Mark as read on server
    try {
      await axios.post(`${API_BASE}/chat/read/${conv._id}`, {}, { headers: getAuthHeaders() });
      setConversations((prev) =>
        prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
      );
      window.dispatchEvent(new CustomEvent("chat_messages_seen"));
    } catch (_) {}

    // Load messages
    try {
      const res = await axios.get(`${API_BASE}/chat/messages/${conv._id}`, {
        headers: getAuthHeaders(),
      });
      if (res.data?.success) {
        const msgs = res.data.messages || [];
        setMessages(msgs);

        // Decrypt all messages locally in client
        const key = await getConversationCryptoKey(conv._id);
        if (key) {
          const textMap = {};
          await Promise.all(
            msgs.map(async (m) => {
              if (m.isDeleted) {
                textMap[m._id] = "This message was deleted";
              } else if (m.encryptedText && m.iv) {
                const plain = await decryptChatMessage(m.encryptedText, m.iv, key);
                textMap[m._id] = plain;
              }
            })
          );
          setDecryptedTextMap(textMap);
        }
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, decryptedTextMap]);

  // 6. Typing event emission (debounced)
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (!activeConversation || !currentUser) return;

    if (!typingTimerRef.current) {
      socketRef.current?.emit("typing_start", {
        conversationId: activeConversation._id,
        userId: currentUser.id,
        username: currentUser.username,
      });
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("typing_stop", {
        conversationId: activeConversation._id,
        userId: currentUser.id,
        username: currentUser.username,
      });
      typingTimerRef.current = null;
    }, 2000);
  };

  // 7. Parse Link Preview metadata (100% Free, Zero R2 storage)
  const detectLink = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  // 8. Send Encrypted Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const rawText = inputText.trim();
    if (!rawText || !activeConversation || isSending) return;

    try {
      setIsSending(true);

      // 1. Client-Side E2EE Encryption
      const key = await getConversationCryptoKey(activeConversation._id);
      const { ciphertext, iv } = await encryptChatMessage(rawText, key);

      // 2. Extract link metadata if URL present
      let linkPreview = null;
      const detectedUrl = detectLink(rawText);
      if (detectedUrl) {
        try {
          const previewRes = await axios.get(
            `${API_BASE}/post/preview?url=${encodeURIComponent(detectedUrl)}`
          );
          if (previewRes.data?.data) {
            const p = previewRes.data.data;
            linkPreview = {
              url: detectedUrl,
              title: p.title || "",
              description: p.description || "",
              image: p.image || "",
              siteName: p.siteName || "",
            };
          }
        } catch (_) {
          linkPreview = { url: detectedUrl };
        }
      }

      // 3. Post to backend
      const payload = {
        conversationId: activeConversation._id,
        encryptedText: ciphertext,
        iv,
        messageType: linkPreview ? "link" : "text",
        linkPreview,
        replyTo: replyingTo?._id || null,
      };

      const res = await axios.post(`${API_BASE}/chat/send`, payload, {
        headers: getAuthHeaders(),
      });

      if (res.data?.success && res.data.message) {
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);
        setDecryptedTextMap((prev) => ({ ...prev, [newMsg._id]: rawText }));
        setInputText("");
        setReplyingTo(null);
        setShowEmojiPicker(false);
        playPop();
      }
    } catch (err) {
      console.error("Send error:", err);
      toast.error(err.response?.data?.error || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // 9. Start Message Editing
  const handleStartEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditingText(decryptedTextMap[msg._id] || "");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleSaveEdit = async () => {
    if (!editingText.trim() || !editingMessageId || isSavingEdit) return;

    try {
      setIsSavingEdit(true);
      const key = await getConversationCryptoKey(activeConversation._id);
      const { ciphertext, iv } = await encryptChatMessage(editingText.trim(), key);

      const res = await axios.put(
        `${API_BASE}/chat/message/edit/${editingMessageId}`,
        { encryptedText: ciphertext, iv },
        { headers: getAuthHeaders() }
      );

      if (res.data?.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === editingMessageId
              ? { ...m, encryptedText: ciphertext, iv, isEdited: true, editedAt: new Date() }
              : m
          )
        );
        setDecryptedTextMap((prev) => ({ ...prev, [editingMessageId]: editingText.trim() }));
        setEditingMessageId(null);
        setEditingText("");
        toast.success("Message edited");
        playTap();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to edit message");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 10. Delete Message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await axios.delete(`${API_BASE}/chat/message/delete/${messageId}`, {
        headers: getAuthHeaders(),
      });

      if (res.data?.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, isDeleted: true, encryptedText: "", linkPreview: undefined, reactions: [] }
              : m
          )
        );
        setDecryptedTextMap((prev) => ({ ...prev, [messageId]: "This message was deleted" }));
        toast.info("Message deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete message");
    }
  };

  // 11. Reaction Handler
  const handleReaction = async (messageId, emoji) => {
    try {
      playTap();
      const res = await axios.post(
        `${API_BASE}/chat/react`,
        { messageId, emoji },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, reactions: res.data.reactions } : m))
        );
      }
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  // 12. Create New Group Chat
  const handleCreateGroup = async () => {
    if (!groupNameInput.trim() || groupSelectedUserIds.length === 0) return;
    try {
      const res = await axios.post(
        `${API_BASE}/chat/group`,
        {
          groupName: groupNameInput.trim(),
          participantIds: groupSelectedUserIds,
        },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success && res.data.conversation) {
        const newGroup = res.data.conversation;
        setConversations((prev) => [newGroup, ...prev]);
        setShowNewGroupModal(false);
        setGroupNameInput("");
        setGroupSelectedUserIds([]);
        selectConversation(newGroup);
        toast.success(`Group "${newGroup.groupName}" created!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create group");
    }
  };

  // 13. Group Settings & Permissions Handlers
  const isCurrentUserAdmin = Boolean(
    activeConversation?.isGroup &&
    activeConversation?.groupAdmins?.some((a) => {
      const adminId = typeof a === "object" ? a?._id : a;
      return String(adminId) === String(currentUser?.id);
    })
  );

  const canUserSendMessage = Boolean(
    !activeConversation?.isGroup ||
    !activeConversation?.onlyAdminsCanMessage ||
    isCurrentUserAdmin
  );

  const handleOpenGroupSettings = () => {
    if (!activeConversation) return;
    setEditGroupName(activeConversation.groupName || "");
    setEditGroupDesc(activeConversation.groupDescription || "");
    setOnlyAdminsCanMessageState(Boolean(activeConversation.onlyAdminsCanMessage));
    setOnlyAdminsCanEditInfoState(Boolean(activeConversation.onlyAdminsCanEditInfo));
    setShowGroupSettingsModal(true);
    playPop();
  };

  const handleSaveGroupSettings = async () => {
    if (!activeConversation || isSavingGroupSettings) return;

    try {
      setIsSavingGroupSettings(true);
      const res = await axios.put(
        `${API_BASE}/chat/group/settings/${activeConversation._id}`,
        {
          groupName: editGroupName,
          groupDescription: editGroupDesc,
          onlyAdminsCanMessage: onlyAdminsCanMessageState,
          onlyAdminsCanEditInfo: onlyAdminsCanEditInfoState,
        },
        { headers: getAuthHeaders() }
      );

      if (res.data?.success && res.data.conversation) {
        setActiveConversation(res.data.conversation);
        setConversations((prev) =>
          prev.map((c) => (c._id === res.data.conversation._id ? res.data.conversation : c))
        );
        toast.success("Group settings updated");
        playTap();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update group settings");
    } finally {
      setIsSavingGroupSettings(false);
    }
  };

  const handleSearchAddMembers = async (q) => {
    setAddMemberQuery(q);
    if (!q.trim()) {
      setAddMemberResults([]);
      return;
    }
    try {
      setSearchingAddMember(true);
      const res = await axios.get(`${API_BASE}/user/search?q=${encodeURIComponent(q)}`);
      if (res.data?.users) {
        // Filter out existing participants
        const existingIds = new Set(
          (activeConversation.participants || []).map((p) =>
            typeof p === "object" ? String(p._id) : String(p)
          )
        );
        setAddMemberResults(res.data.users.filter((u) => !existingIds.has(String(u._id))));
      }
    } catch (_) {
    } finally {
      setSearchingAddMember(false);
    }
  };

  const handleAddMemberToGroup = async (userId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/chat/group/add-member/${activeConversation._id}`,
        { newUserId: userId },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success && res.data.conversation) {
        setActiveConversation(res.data.conversation);
        setConversations((prev) =>
          prev.map((c) => (c._id === res.data.conversation._id ? res.data.conversation : c))
        );
        setAddMemberQuery("");
        setAddMemberResults([]);
        toast.success("Member added to group!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add member");
    }
  };

  const handleRemoveMemberFromGroup = async (userId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    try {
      const res = await axios.post(
        `${API_BASE}/chat/group/remove-member/${activeConversation._id}`,
        { targetUserId: userId },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success && res.data.conversation) {
        setActiveConversation(res.data.conversation);
        setConversations((prev) =>
          prev.map((c) => (c._id === res.data.conversation._id ? res.data.conversation : c))
        );
        toast.info("Member removed");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove member");
    }
  };

  const handleToggleAdminStatus = async (userId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/chat/group/toggle-admin/${activeConversation._id}`,
        { targetUserId: userId },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success && res.data.conversation) {
        setActiveConversation(res.data.conversation);
        setConversations((prev) =>
          prev.map((c) => (c._id === res.data.conversation._id ? res.data.conversation : c))
        );
        toast.success("Admin role updated");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update admin role");
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await axios.post(
        `${API_BASE}/chat/group/leave/${activeConversation._id}`,
        {},
        { headers: getAuthHeaders() }
      );
      setConversations((prev) => prev.filter((c) => c._id !== activeConversation._id));
      setActiveConversation(null);
      setShowGroupSettingsModal(false);
      toast.info("You left the group");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to leave group");
    }
  };

  // 14. Search Users Modal
  const handleSearchUsers = async (q) => {
    if (!q.trim()) {
      setUserSearchResults([]);
      return;
    }
    try {
      setSearchingUsers(true);
      const res = await axios.get(`${API_BASE}/user/search?q=${encodeURIComponent(q)}`);
      if (res.data?.users) {
        setUserSearchResults(res.data.users.filter((u) => u._id !== currentUser?.id));
      }
    } catch (_) {
    } finally {
      setSearchingUsers(false);
    }
  };

  // Helper to extract conversation title & avatar
  const getConvDisplay = (conv) => {
    if (conv.isGroup) {
      return {
        title: conv.groupName || "Unnamed Group",
        subtitle: `${conv.participants?.length || 0} members`,
        avatar: conv.groupAvatar || null,
        isGroup: true,
      };
    }
    const otherUser = conv.participants?.find((p) => p._id !== currentUser?.id) || {};
    return {
      title: otherUser.name || otherUser.username || "Creator",
      subtitle: otherUser.username ? `@${otherUser.username}` : "Encrypted Direct Chat",
      avatar: otherUser.profilePicture || otherUser.profilePic || otherUser.avatar,
      isVerified: otherUser.isVerified,
      isGroup: false,
    };
  };

  // Filtered conversations list
  const filteredConversations = conversations.filter((c) => {
    if (filterTab === "direct" && c.isGroup) return false;
    if (filterTab === "groups" && !c.isGroup) return false;
    if (!searchQuery.trim()) return true;

    const info = getConvDisplay(c);
    return (
      info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* ══════════════════════════════════════════════════════════
          SIDEBAR: CONVERSATION LIST (Responsive)
      ══════════════════════════════════════════════════════════ */}
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0 transition-all ${
          activeConversation ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-lg tracking-tight">Messages</h2>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock size={9} />
              <span>E2EE</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                playPop();
                setShowNewGroupModal(true);
              }}
              className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-purple-400 transition-colors"
              title="Create Group Chat"
            >
              <Users size={18} />
            </button>
            <button
              onClick={() => {
                playPop();
                setShowNewChatModal(true);
              }}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md shadow-blue-600/30"
              title="New Message"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-[var(--border-subtle)]">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search chats & creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-subtle)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-gray-500 border border-[var(--border-subtle)] focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 mt-2.5">
            {[
              { id: "all", label: "All" },
              { id: "direct", label: "Direct (DMs)" },
              { id: "groups", label: "Groups" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playTap();
                  setFilterTab(tab.id);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)] no-scrollbar">
          {loadingChats ? (
            <div className="p-6 text-center text-xs text-[var(--text-secondary)]">
              Loading secure conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500 gap-2">
              <Users size={32} className="opacity-40" />
              <p className="text-xs">No conversations found</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="text-xs text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                Start a new conversation
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const info = getConvDisplay(conv);
              const isSelected = activeConversation?._id === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`p-3 sm:p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-600/10 border-l-4 border-blue-500"
                      : "hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)]">
                      {info.avatar ? (
                        <img
                          src={info.avatar}
                          alt={info.title}
                          className="w-full h-full object-cover"
                        />
                      ) : info.isGroup ? (
                        <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                          <Users size={18} />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black">
                          {info.title[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conv Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-xs sm:text-sm truncate">
                          {info.title}
                        </span>
                        {info.isVerified && (
                          <ShieldCheck size={13} className="text-blue-500 shrink-0" />
                        )}
                        {info.isGroup && (
                          <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md">
                            GROUP
                          </span>
                        )}
                      </div>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-[10px] text-gray-500 shrink-0">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] text-gray-400 truncate">
                        {conv.lastMessage?.text ? "🔐 Encrypted message" : info.subtitle}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-blue-600 text-white shrink-0 animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MAIN VIEW: CHAT ROOM
      ══════════════════════════════════════════════════════════ */}
      <div
        className={`flex-1 flex flex-col bg-[var(--bg-canvas)] relative ${
          activeConversation ? "flex" : "hidden md:flex"
        }`}
      >
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-3 shadow-lg shadow-blue-500/5">
              <Sparkles size={28} />
            </div>
            <h3 className="font-bold text-base text-[var(--text-primary)] mb-1">
              FondPeace Secure Encrypted Chat
            </h3>
            <p className="text-xs max-w-sm text-gray-400 mb-4">
              Select a conversation from the sidebar or start a new direct message. Messages are protected by AES-256-GCM End-to-End Encryption.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/25 cursor-pointer"
            >
              Start New Message
            </button>
          </div>
        ) : (
          <>
            {/* 1. Chat Header */}
            <div className="h-16 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden p-1.5 -ml-1 text-gray-400 hover:text-white rounded-lg hover:bg-[var(--bg-subtle)]"
                >
                  <ChevronLeft size={20} />
                </button>

                <div
                  onClick={() => {
                    if (activeConversation.isGroup) {
                      handleOpenGroupSettings();
                    }
                  }}
                  className={`flex items-center gap-2.5 min-w-0 ${
                    activeConversation.isGroup ? "cursor-pointer group" : ""
                  }`}
                  title={activeConversation.isGroup ? "Click to view group info & settings" : ""}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border-subtle)] shrink-0 flex items-center justify-center">
                    {getConvDisplay(activeConversation).avatar ? (
                      <img
                        src={getConvDisplay(activeConversation).avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : activeConversation.isGroup ? (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                        <Users size={16} />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                        {getConvDisplay(activeConversation).title[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm truncate group-hover:text-blue-400 transition-colors">
                        {getConvDisplay(activeConversation).title}
                      </h3>
                      {getConvDisplay(activeConversation).isVerified && (
                        <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                      )}
                      {activeConversation.isGroup && (
                        <Settings size={13} className="text-gray-400 group-hover:text-purple-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">
                      {Object.keys(typingUsers).length > 0
                        ? `${Object.values(typingUsers).join(", ")} is typing...`
                        : activeConversation.isGroup
                        ? `${activeConversation.participants?.length || 0} members • Tap for settings`
                        : "Encrypted Room"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Encryption Banner Badge */}
              <div className="flex items-center gap-2">
                {activeConversation.isGroup && (
                  <button
                    onClick={handleOpenGroupSettings}
                    className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Settings size={14} />
                    <span className="hidden sm:inline">Settings</span>
                  </button>
                )}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <Lock size={12} />
                  <span className="hidden sm:inline">End-to-End Encrypted</span>
                </div>
              </div>
            </div>

            {/* 2. Messages Feed */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 no-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-xs gap-1.5">
                  <Lock size={20} className="text-emerald-400 opacity-60" />
                  <p className="font-semibold text-[var(--text-primary)]">Messages are End-to-End Encrypted</p>
                  <p className="text-[11px] max-w-xs text-gray-400">
                    No one outside this chat, not even FondPeace servers, can read them. Send a message to start!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender?._id === currentUser?.id;
                  const decrypted = decryptedTextMap[msg._id] || (msg.isDeleted ? "This message was deleted" : "Decrypting...");
                  const isHovered = hoveredMessageId === msg._id;
                  const isEditingThis = editingMessageId === msg._id;

                  return (
                    <div
                      key={msg._id}
                      onMouseEnter={() => setHoveredMessageId(msg._id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                      className={`relative flex flex-col group ${isMine ? "items-end" : "items-start"}`}
                    >
                      {/* Sender label in group chats */}
                      {activeConversation.isGroup && !isMine && msg.sender?.name && (
                        <span className="text-[10px] text-gray-400 font-semibold mb-1 ml-1 flex items-center gap-1">
                          <span>{msg.sender.name || msg.sender.username}</span>
                          {activeConversation.groupAdmins?.some(
                            (a) => (typeof a === "object" ? a._id : a) === msg.sender?._id
                          ) && (
                            <span className="px-1 py-0.2 text-[8px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                              ADMIN
                            </span>
                          )}
                        </span>
                      )}

                      {/* Replying To Banner preview */}
                      {msg.replyTo && (
                        <div
                          className={`mb-1 p-1.5 px-2.5 rounded-lg text-[10px] border max-w-xs truncate ${
                            isMine
                              ? "bg-blue-700/30 border-blue-500/30 text-blue-200"
                              : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-gray-400"
                          }`}
                        >
                          <span className="font-bold mr-1">
                            {msg.replyTo.sender?.username || "Reply"}:
                          </span>
                          <span>{decryptedTextMap[msg.replyTo._id] || "Encrypted message"}</span>
                        </div>
                      )}

                      {/* Message Bubble Container */}
                      <div className="relative max-w-[85%] sm:max-w-[70%]">
                        <div
                          className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md break-words ${
                            msg.isDeleted
                              ? "bg-[var(--bg-subtle)]/60 text-gray-400 italic border border-[var(--border-subtle)] rounded-2xl"
                              : isMine
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs"
                              : "bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-xs"
                          }`}
                        >
                          {/* Deleted Message State */}
                          {msg.isDeleted ? (
                            <p className="flex items-center gap-1.5 text-xs">
                              <Ban size={13} className="text-gray-500" />
                              <span>This message was deleted</span>
                            </p>
                          ) : isEditingThis ? (
                            /* Inline Edit Mode */
                            <div className="space-y-2">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full bg-black/30 text-white p-2 rounded-xl text-xs sm:text-sm border border-white/20 focus:outline-none resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-xs font-bold"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveEdit}
                                  disabled={isSavingEdit || !editingText.trim()}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Normal Text Display */
                            <>
                              <p className="whitespace-pre-wrap">{decrypted}</p>

                              {/* Zero-Storage Rich Embedded Link Preview */}
                              {msg.linkPreview?.url && (
                                <a
                                  href={msg.linkPreview.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2.5 block rounded-xl overflow-hidden border border-white/15 bg-black/40 hover:bg-black/60 transition-colors group/link cursor-pointer text-left"
                                >
                                  {msg.linkPreview.image && (
                                    <div className="relative w-full aspect-video bg-black overflow-hidden">
                                      <img
                                        src={msg.linkPreview.image}
                                        alt={msg.linkPreview.title || "Link preview"}
                                        className="w-full h-full object-cover group-hover/link:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                      />
                                    </div>
                                  )}
                                  <div className="p-2.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                                      <Globe size={10} />
                                      <span>{msg.linkPreview.siteName || "Web Link"}</span>
                                      <ExternalLink size={9} className="ml-auto opacity-70" />
                                    </span>
                                    {msg.linkPreview.title && (
                                      <h4 className="font-bold text-xs text-white truncate mt-0.5">
                                        {msg.linkPreview.title}
                                      </h4>
                                    )}
                                    {msg.linkPreview.description && (
                                      <p className="text-[10px] text-gray-300 line-clamp-2 mt-0.5">
                                        {msg.linkPreview.description}
                                      </p>
                                    )}
                                  </div>
                                </a>
                              )}
                            </>
                          )}

                          {/* Footer: Time, Status Ticks, Edited tag */}
                          {!msg.isDeleted && !isEditingThis && (
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                                isMine ? "text-blue-200" : "text-gray-500"
                              }`}
                            >
                              {msg.isEdited && (
                                <span className="italic opacity-80 mr-1 text-[9px]">(edited)</span>
                              )}
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMine && (
                                <span>
                                  {msg.readBy?.length > 1 ? (
                                    <CheckCheck size={13} className="text-sky-300" />
                                  ) : (
                                    <Check size={12} className="opacity-80" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Reactions Pills */}
                        {msg.reactions?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {msg.reactions.map((r, i) => (
                              <button
                                key={i}
                                onClick={() => handleReaction(msg._id, r.emoji)}
                                className="px-1.5 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] flex items-center gap-1 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                              >
                                <span>{r.emoji}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Hover Quick Actions Bar */}
                        {isHovered && !msg.isDeleted && !isEditingThis && (
                          <div
                            className={`absolute top-0 -translate-y-1/2 flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1 rounded-full shadow-lg z-20 ${
                              isMine ? "left-0 -translate-x-full mr-2" : "right-0 translate-x-full ml-2"
                            }`}
                          >
                            {["❤️", "😂", "👍", "🔥"].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg._id, emoji)}
                                className="p-1 hover:scale-125 transition-transform text-xs cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}

                            <button
                              onClick={() => {
                                playTap();
                                setReplyingTo(msg);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                              title="Reply"
                            >
                              <Reply size={12} />
                            </button>

                            {/* Edit Button (Sender Only) */}
                            {isMine && (
                              <button
                                onClick={() => handleStartEdit(msg)}
                                className="p-1 text-gray-400 hover:text-amber-400 transition-colors"
                                title="Edit message"
                              >
                                <Pencil size={12} />
                              </button>
                            )}

                            {/* Delete Button (Sender or Group Admin) */}
                            {(isMine || isCurrentUserAdmin) && (
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                className="p-1 text-gray-400 hover:text-rose-400 transition-colors"
                                title="Delete message"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 3. Input Bar */}
            <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              {/* If group is restricted to admins only and user is not admin */}
              {!canUserSendMessage ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center justify-center gap-2">
                  <Lock size={14} />
                  <span>Only group administrators can send messages in this group.</span>
                </div>
              ) : (
                <>
                  {/* Reply Preview */}
                  {replyingTo && (
                    <div className="mb-2 p-2 px-3 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between text-xs">
                      <div className="truncate">
                        <span className="font-bold text-blue-400 mr-1.5">
                          Replying to {replyingTo.sender?.username || "message"}:
                        </span>
                        <span className="text-[var(--text-secondary)]">
                          {decryptedTextMap[replyingTo._id] || "Encrypted message"}
                        </span>
                      </div>
                      <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-white ml-2">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="text"
                        placeholder="Type an encrypted message or paste a link..."
                        value={inputText}
                        onChange={handleInputChange}
                        className="w-full bg-[var(--bg-subtle)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] placeholder-gray-500 border border-[var(--border-subtle)] focus:outline-none focus:border-blue-500/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-3 text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer"
                      >
                        <Smile size={18} />
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending}
                      className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/30 cursor-pointer shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </form>

                  {/* Quick Emoji Picker Drawer */}
                  {showEmojiPicker && (
                    <div className="mt-2 p-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center gap-2 flex-wrap text-lg">
                      {["❤️", "😂", "🔥", "👍", "😮", "🙏", "🎉", "💯", "👏", "✨", "🙌", "😍"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setInputText((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="hover:scale-125 transition-transform cursor-pointer p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: NEW 1-ON-1 CHAT
      ───────────────────────────────────────────────────────────── */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <User size={18} className="text-blue-400" />
                <span>New Direct Message</span>
              </h3>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setUserSearchResults([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search username or name..."
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-[var(--border-subtle)] no-scrollbar">
              {searchingUsers ? (
                <p className="text-xs text-gray-500 text-center py-4">Searching creators...</p>
              ) : userSearchResults.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Type a username to find creators</p>
              ) : (
                userSearchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => {
                      initiateDirectChat(u._id);
                      setShowNewChatModal(false);
                      setUserSearchResults([]);
                    }}
                    className="p-2.5 flex items-center gap-3 hover:bg-[var(--bg-subtle)] cursor-pointer rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                      {u.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{u.name || u.username}</h4>
                      <p className="text-[10px] text-gray-400">@{u.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: NEW GROUP CHAT
      ───────────────────────────────────────────────────────────── */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users size={18} className="text-purple-400" />
                <span>Create Group Chat</span>
              </h3>
              <button
                onClick={() => {
                  setShowNewGroupModal(false);
                  setUserSearchResults([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Group Name (e.g. FondPeace Creators Club)"
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              className="w-full bg-[var(--bg-subtle)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-purple-500/50"
            />

            <div className="relative">
              <Search size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search and add members..."
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-[var(--border-subtle)] no-scrollbar">
              {userSearchResults.map((u) => {
                const isSelected = groupSelectedUserIds.includes(u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => {
                      setGroupSelectedUserIds((prev) =>
                        isSelected ? prev.filter((id) => id !== u._id) : [...prev, u._id]
                      );
                    }}
                    className="p-2 flex items-center justify-between hover:bg-[var(--bg-subtle)] cursor-pointer rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-xs">
                        {u.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">{u.name || u.username}</h4>
                        <p className="text-[10px] text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                        isSelected ? "bg-purple-600 text-white" : "border border-gray-600"
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleCreateGroup}
              disabled={!groupNameInput.trim() || groupSelectedUserIds.length === 0}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              Create Group ({groupSelectedUserIds.length} members)
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: GROUP SETTINGS, PERMISSIONS & MEMBERS MANAGEMENT
      ───────────────────────────────────────────────────────────── */}
      {showGroupSettingsModal && activeConversation?.isGroup && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-purple-400" />
                <h3 className="font-bold text-base">Group Info & Settings</h3>
              </div>
              <button
                onClick={() => setShowGroupSettingsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Basic Info & Admin Edit */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  disabled={!isCurrentUserAdmin && activeConversation.onlyAdminsCanEditInfo}
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-purple-500/50 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Group Description / Topic
                </label>
                <textarea
                  rows={2}
                  disabled={!isCurrentUserAdmin && activeConversation.onlyAdminsCanEditInfo}
                  placeholder="What is this group about?"
                  value={editGroupDesc}
                  onChange={(e) => setEditGroupDesc(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-purple-500/50 disabled:opacity-60 resize-none"
                />
              </div>

              {/* Admin-only Permission Toggles */}
              {isCurrentUserAdmin && (
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2.5">
                  <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Shield size={14} />
                    <span>Admin Permission Controls</span>
                  </h4>

                  {/* Toggle 1: Only Admins Can Send Messages */}
                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">Only Admins Can Send Messages</p>
                      <p className="text-[10px] text-gray-400">Turn this group into an announcement-only channel</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={onlyAdminsCanMessageState}
                      onChange={(e) => setOnlyAdminsCanMessageState(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </label>

                  {/* Toggle 2: Only Admins Can Edit Info */}
                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">Only Admins Can Edit Info</p>
                      <p className="text-[10px] text-gray-400">Prevent regular members from changing name or description</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={onlyAdminsCanEditInfoState}
                      onChange={(e) => setOnlyAdminsCanEditInfoState(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                </div>
              )}

              {/* Save Settings Button */}
              {(isCurrentUserAdmin || !activeConversation.onlyAdminsCanEditInfo) && (
                <button
                  onClick={handleSaveGroupSettings}
                  disabled={isSavingGroupSettings}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition cursor-pointer"
                >
                  {isSavingGroupSettings ? "Saving Settings..." : "Save Group Settings"}
                </button>
              )}
            </div>

            {/* Members Section */}
            <div className="border-t border-[var(--border-subtle)] pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Members ({activeConversation.participants?.length || 0})
                </h4>
              </div>

              {/* Add Member Search Input */}
              {(isCurrentUserAdmin || !activeConversation.onlyAdminsCanEditInfo) && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add member by username..."
                      value={addMemberQuery}
                      onChange={(e) => handleSearchAddMembers(e.target.value)}
                      className="w-full bg-[var(--bg-subtle)] rounded-xl pl-9 pr-3 py-2 text-xs border border-[var(--border-subtle)] focus:outline-none"
                    />
                  </div>

                  {addMemberResults.length > 0 && (
                    <div className="p-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] max-h-36 overflow-y-auto space-y-1">
                      {addMemberResults.map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between p-1.5 hover:bg-[var(--bg-surface)] rounded-lg text-xs"
                        >
                          <span className="font-semibold truncate">@{u.username}</span>
                          <button
                            onClick={() => handleAddMemberToGroup(u._id)}
                            className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-bold text-[10px] hover:bg-purple-500"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar divide-y divide-[var(--border-subtle)]">
                {activeConversation.participants?.map((member) => {
                  const mId = typeof member === "object" ? member._id : member;
                  const mName = typeof member === "object" ? member.name || member.username : "User";
                  const mUsername = typeof member === "object" ? member.username : "";
                  const mIsAdmin = activeConversation.groupAdmins?.some(
                    (a) => (typeof a === "object" ? a._id : a) === mId
                  );
                  const isMe = String(mId) === String(currentUser?.id);

                  return (
                    <div key={mId} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-[11px]">
                          {mName[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="truncate">
                          <p className="font-bold truncate">
                            {mName} {isMe && "(You)"}
                          </p>
                          <p className="text-[10px] text-gray-400">@{mUsername}</p>
                        </div>
                        {mIsAdmin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                            <Crown size={9} />
                            <span>Admin</span>
                          </span>
                        )}
                      </div>

                      {/* Admin Actions on this member */}
                      {isCurrentUserAdmin && !isMe && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleAdminStatus(mId)}
                            className="p-1 rounded text-gray-400 hover:text-amber-400 transition"
                            title={mIsAdmin ? "Dismiss as Admin" : "Make Admin"}
                          >
                            <Shield size={13} />
                          </button>
                          <button
                            onClick={() => handleRemoveMemberFromGroup(mId)}
                            className="p-1 rounded text-gray-400 hover:text-rose-400 transition"
                            title="Remove Member"
                          >
                            <UserMinus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Leave Group Action */}
              <div className="border-t border-[var(--border-subtle)] pt-3">
                <button
                  onClick={handleLeaveGroup}
                  className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Leave Group</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-secondary)]">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
