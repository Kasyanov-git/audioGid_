import TrackPlayer, { Capability } from 'react-native-track-player';

export async function setupPlayer() {
  await TrackPlayer.setupPlayer();
  TrackPlayer.updateOptions({
    // stopAppOnExit: false,
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
  });
}
