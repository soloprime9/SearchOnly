import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, ScrollView, Modal, Alert, ActivityIndicator 
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const API_BASE = "https://backend-k.vercel.app/api/reminders";
const USER_ID = "65f1234567890abcdef12345"; // Mock User ID (Match your MongoDB ObjectId)

// Configure Notification Behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date());
  const [priority, setPriority] = useState('medium');
  const [subTask, setSubTask] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    setupApp();
    fetchReminders();
  }, []);

  const setupApp = async () => {
    await Notifications.requestPermissionsAsync();
    await Location.requestForegroundPermissionsAsync();
  };

  const fetchReminders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/${USER_ID}`);
      setReminders(res.data.data);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const addChecklistItem = () => {
    if (subTask) {
      setChecklist([...checklist, { text: subTask, isCompleted: false }]);
      setSubTask('');
    }
  };

  const handleCreate = async () => {
    if (!title) return Alert.alert("Title required");
    
    const payload = {
      userId: USER_ID,
      title,
      description: desc,
      dueDate: date,
      priority,
      checklist,
      status: 'pending'
    };

    try {
      setLoading(true);
      await axios.post(API_BASE, payload);
      setModalVisible(false);
      resetForm();
      fetchReminders();
    } catch (err) {
      Alert.alert("Error saving reminder");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setDesc(''); setChecklist([]); setPriority('medium');
  };

  const toggleSubTask = async (reminderId, itemId, currentStatus) => {
    try {
      await axios.patch(`${API_BASE}/${reminderId}/checklist`, {
        itemId,
        isCompleted: !currentStatus
      });
      fetchReminders();
    } catch (err) {
      console.log(err);
    }
  };

  const markComplete = async (id) => {
    try {
      await axios.put(`${API_BASE}/${id}/complete`);
      fetchReminders();
    } catch (err) {
      console.log(err);
    }
  };

  const renderReminder = ({ item }) => (
    <View style={[styles.card, { borderLeftColor: getPriorityColor(item.scheduling.priority) }]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>{new Date(item.scheduling.dueDate).toLocaleString()}</Text>
        </View>
        <TouchableOpacity onPress={() => markComplete(item._id)} style={styles.doneBtn}>
          <Text style={{color: '#fff', fontSize: 12}}>Done</Text>
        </TouchableOpacity>
      </View>

      {item.checklist.length > 0 && (
        <View style={styles.checklistArea}>
          {item.checklist.map((task) => (
            <TouchableOpacity 
              key={task._id} 
              onPress={() => toggleSubTask(item._id, task._id, task.isCompleted)}
              style={styles.subtaskRow}
            >
              <Text style={[styles.subtaskText, task.isCompleted && styles.completedText]}>
                {task.isCompleted ? "✅ " : "⭕ "} {task.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const getPriorityColor = (p) => {
    switch(p) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#5856D6';
      default: return '#34C759';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Reminders</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#5856D6" /> : (
        <FlatList 
          data={reminders}
          renderItem={renderReminder}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Modal for adding new Reminder */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Smart Reminder</Text>
          
          <TextInput 
            placeholder="What's the task?" 
            style={styles.input} 
            onChangeText={setTitle}
          />
          
          <TextInput 
            placeholder="Description (Optional)" 
            style={[styles.input, { height: 80 }]} 
            multiline
            onChangeText={setDesc}
          />

          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityRow}>
            {['low', 'medium', 'high', 'critical'].map(p => (
              <TouchableOpacity 
                key={p} 
                onPress={() => setPriority(p)}
                style={[styles.pBtn, priority === p && { backgroundColor: getPriorityColor(p) }]}
              >
                <Text style={{color: priority === p ? '#fff' : '#000', fontSize: 12}}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
            <Text>⏰ {date.toLocaleString()}</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker 
              value={date} 
              mode="datetime" 
              onChange={(e, d) => { setShowPicker(false); if(d) setDate(d); }} 
            />
          )}

          <Text style={styles.label}>Checklist (Sub-tasks)</Text>
          <View style={{ flexDirection: 'row' }}>
            <TextInput 
              placeholder="Add item..." 
              style={[styles.input, { flex: 1 }]} 
              value={subTask}
              onChangeText={setSubTask}
            />
            <TouchableOpacity onPress={addChecklistItem} style={styles.addSubBtn}>
              <Text style={{color: '#fff'}}>+</Text>
            </TouchableOpacity>
          </View>

          {checklist.map((item, idx) => (
            <Text key={idx} style={styles.subtaskPreview}>• {item.text}</Text>
          ))}

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreate} style={styles.saveBtn}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>Create Reminder</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  headerText: { fontSize: 32, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#5856D6', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 24 },
  card: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, borderRadius: 15, padding: 15, borderLeftWidth: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDate: { color: '#8E8E93', fontSize: 13, marginTop: 4 },
  doneBtn: { backgroundColor: '#34C759', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  checklistArea: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 10 },
  subtaskRow: { marginVertical: 4 },
  subtaskText: { fontSize: 14, color: '#48484A' },
  completedText: { textDecorationLine: 'line-through', color: '#AEA9B1' },
  modalContent: { flex: 1, padding: 25, backgroundColor: '#fff' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#F2F2F7', padding: 15, borderRadius: 12, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#8E8E93' },
  priorityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  pBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#F2F2F7', width: '23%', alignItems: 'center' },
  addSubBtn: { backgroundColor: '#5856D6', width: 50, height: 50, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  subtaskPreview: { marginLeft: 10, marginBottom: 5, color: '#5856D6' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 50 },
  cancelBtn: { padding: 15, flex: 1, alignItems: 'center' },
  saveBtn: { backgroundColor: '#5856D6', padding: 15, flex: 2, borderRadius: 12, alignItems: 'center' }
});
