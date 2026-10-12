// src/utils/featureFlags.js
/**
 * 🔌 Platform Feature Flags & Master Kill-Switches
 * Change any flag to false anytime to instantly turn off a feature without modifying core code.
 */
export const FEATURE_FLAGS = {
  // Master Kill-Switch for YouTube Shorts in Reels Feed
  // 'true': Plays YouTube Shorts alongside native videos
  // 'false': 100% shuts off external shorts, playing only native uploaded videos
  ENABLE_YOUTUBE_SHORTS: true,
};
