import TrackPlayer, { 
  Capability,
  AppKilledPlaybackBehavior,
  Event 
} from 'react-native-track-player';

export async function setupPlayer() {
  await TrackPlayer.setupPlayer();
  TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
    ],
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    progressUpdateEventInterval: 2,
  });
}
