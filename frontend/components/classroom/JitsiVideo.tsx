import React, { useEffect, useRef } from 'react';

interface JitsiVideoProps {
  roomName: string;
  displayName: string;
  isTeacher?: boolean;
  onMeetingEnd?: () => void;
}

const JitsiVideo: React.FC<JitsiVideoProps> = ({
  roomName,
  displayName,
  isTeacher = false,
  onMeetingEnd
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    if (!jitsiContainerRef.current) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      width: '100%',
      height: 500,
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: displayName,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableModeratorIndicator: !isTeacher,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        enableClosePage: false,
        disableInviteFunctions: true,
        toolbarButtons: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
          'tileview', 'select-background', 'download', 'help', 'mute-everyone',
          'security'
        ]
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        TOOLBAR_ALWAYS_VISIBLE: true,
        DEFAULT_BACKGROUND: '#1e293b',
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        DISABLE_FOCUS_INDICATOR: true,
        DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
        DISABLE_VIDEO_BACKGROUND: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
        MOBILE_APP_PROMO: false,
        PROVIDER_NAME: 'BioLearn AI'
      }
    };

    // @ts-ignore - JitsiMeetExternalAPI is loaded via script tag
    const api = new JitsiMeetExternalAPI(domain, options);
    jitsiApiRef.current = api;

    api.addEventListener('readyToClose', () => {
      if (onMeetingEnd) onMeetingEnd();
      api.dispose();
    });

    api.addEventListener('videoConferenceLeft', () => {
      if (onMeetingEnd) onMeetingEnd();
      api.dispose();
    });

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomName, displayName, isTeacher, onMeetingEnd]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
};

export default JitsiVideo;