import React, { useEffect, useRef, useState } from "react";
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "expo-constants";

const APP_ID = "bae6f8516d97484b88de16c629ad09f6";

const VideoCallScreen = ({ route, navigation }) => {
  const { channelName } = route.params;
  const engineRef = useRef(null);
  const eventHandlerRef = useRef(null);

  const [agoraModule, setAgoraModule] = useState(null);
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const requestRuntimePermissions = async () => {
      if (Platform.OS !== "android") {
        return true;
      }

      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      const cameraGranted =
        result[PermissionsAndroid.PERMISSIONS.CAMERA] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const micGranted =
        result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
        PermissionsAndroid.RESULTS.GRANTED;

      return cameraGranted && micGranted;
    };

    const init = async () => {
      try {
        const isExpoGo = Constants.appOwnership === "expo";
        if (isExpoGo) {
          setErrorMessage(
            "Video calling needs a custom development build (Expo Go cannot load the Agora native module).",
          );
          return;
        }

        const permissionsGranted = await requestRuntimePermissions();
        if (!permissionsGranted) {
          setErrorMessage("Camera and microphone permissions are required.");
          return;
        }

        const Agora = await import("react-native-agora");
        if (!mounted) return;

        setAgoraModule(Agora);

        const { createAgoraRtcEngine, ChannelProfileType, ClientRoleType } =
          Agora;

        const engine = createAgoraRtcEngine();
        engine.initialize({ appId: APP_ID });
        engine.enableVideo();
        engine.startPreview();

        const handler = {
          onJoinChannelSuccess: () => setJoined(true),
          onUserJoined: (_connection, uid) => setRemoteUid(uid),
          onUserOffline: (_connection, uid) => {
            setRemoteUid((currentUid) =>
              currentUid === uid ? null : currentUid,
            );
          },
          onError: (errorCode, message) => {
            setErrorMessage(
              `Agora error ${errorCode}: ${message || "Unknown error"}`,
            );
          },
        };

        eventHandlerRef.current = handler;
        engine.registerEventHandler(handler);

        const joinResult = engine.joinChannel(null, channelName, 0, {
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          publishCameraTrack: true,
          publishMicrophoneTrack: true,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        });

        if (joinResult !== 0) {
          throw new Error(`joinChannel failed with code ${joinResult}`);
        }

        engineRef.current = engine;
      } catch (error) {
        const message = error?.message || "Unknown initialization error";
        setErrorMessage(message);
      }
    };

    init();

    return () => {
      mounted = false;

      const engine = engineRef.current;
      if (!engine) return;

      if (eventHandlerRef.current) {
        engine.unregisterEventHandler(eventHandlerRef.current);
      }

      engine.leaveChannel();
      engine.release();
      engineRef.current = null;
    };
  }, [channelName]);

  const endCall = () => {
    engineRef.current?.leaveChannel();
    navigation.goBack();
  };
  const RtcSurfaceView = agoraModule?.RtcSurfaceView;
  const RenderModeType = agoraModule?.RenderModeType;
  const VideoSourceType = agoraModule?.VideoSourceType;
  return (
    <View style={styles.container}>
      {errorMessage ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.endBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.endBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {remoteUid !== null && RtcSurfaceView ? (
            <RtcSurfaceView
              style={styles.remoteVideo}
              canvas={{
                uid: remoteUid,
                renderMode: RenderModeType.RenderModeHidden,
              }}
            />
          ) : (
            <Text style={styles.waiting}>Waiting for user...</Text>
          )}

          {joined && RtcSurfaceView && (
            <RtcSurfaceView
              style={styles.localVideo}
              zOrderMediaOverlay
              canvas={{
                uid: 0,
                renderMode: RenderModeType.RenderModeHidden,
                sourceType: VideoSourceType.VideoSourceCamera,
              }}
            />
          )}

          <TouchableOpacity style={styles.endBtn} onPress={endCall}>
            <Text style={styles.endBtnText}>End Call</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
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
  errorText: {
    color: "#fff",
    textAlign: "center",
  },
  endBtn: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "red",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  endBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
