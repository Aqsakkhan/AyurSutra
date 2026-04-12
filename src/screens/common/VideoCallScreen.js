import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import RtcEngine, {
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
} from "react-native-agora";

const APP_ID = "bae6f8516d97484b88de16c629ad09f6";

const VideoCallScreen = ({ route, navigation }) => {
  const { channelName } = route.params;

  const [engine, setEngine] = useState(null);
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);

  useEffect(() => {
    const init = async () => {
      const rtcEngine = await RtcEngine.create(APP_ID);

      await rtcEngine.enableVideo();

      rtcEngine.addListener("JoinChannelSuccess", () => {
        setJoined(true);
      });

      rtcEngine.addListener("UserJoined", (uid) => {
        console.log("Remote user joined:", uid);
        setRemoteUid(uid);
      });

      rtcEngine.addListener("UserOffline", () => {
        setRemoteUid(null);
      });

      await rtcEngine.joinChannel(null, channelName, null, 0);

      setEngine(rtcEngine);
    };

    init();

    return () => {
      engine?.leaveChannel();
      engine?.destroy();
    };
  }, []);

  const endCall = async () => {
    engine.leaveChannel();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Remote Video */}
      {remoteUid !== null ? (
        <RtcRemoteView.SurfaceView
          style={styles.remoteVideo}
          uid={remoteUid}
          channelId={channelName}
          renderMode={VideoRenderMode.Hidden}
        />
      ) : (
        <Text style={styles.waiting}>Waiting for user...</Text>
      )}

      {/* Local Video */}
      {joined && (
        <RtcLocalView.SurfaceView
          style={styles.localVideo}
          channelId={channelName}
          renderMode={VideoRenderMode.Hidden}
        />
      )}

      {/* End Call Button */}
      <TouchableOpacity style={styles.endBtn} onPress={endCall}>
        <Text style={{ color: "#fff" }}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  remoteVideo: {
    flex: 1,
  },
  localVideo: {
    position: "absolute",
    width: 120,
    height: 160,
    top: 40,
    right: 10,
    zIndex: 1,
  },
  waiting: {
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  endBtn: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "red",
    padding: 15,
    borderRadius: 30,
  },
});
