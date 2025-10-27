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

    // Load the 8x8.vc JaaS external API script
    const script = document.createElement('script');
    script.src = 'https://8x8.vc/vpaas-magic-cookie-4c5314bc4de84c7a8decf969e272f3d1/external_api.js';
    script.async = true;
    
    script.onload = () => {
      // Initialize Jitsi Meet when script is loaded
      if (typeof window !== 'undefined' && (window as any).JitsiMeetExternalAPI) {
        const options = {
          roomName: `vpaas-magic-cookie-4c5314bc4de84c7a8decf969e272f3d1/${roomName}`,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: 600,
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
            disableInviteFunctions: false,
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
            SHOW_JITSI_WATERMARK: true,
            SHOW_WATERMARK_FOR_GUESTS: true,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
            DEFAULT_BACKGROUND: '#1e293b',
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            DISABLE_FOCUS_INDICATOR: false,
            DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
            DISABLE_VIDEO_BACKGROUND: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
            MOBILE_APP_PROMO: false,
            PROVIDER_NAME: 'BioLearn AI'
          }
        };

        const api = new (window as any).JitsiMeetExternalAPI('8x8.vc', options);
        jitsiApiRef.current = api;

        // Add event listeners
        api.addEventListener('readyToClose', () => {
          if (onMeetingEnd) onMeetingEnd();
          api.dispose();
        });

        api.addEventListener('videoConferenceLeft', () => {
          if (onMeetingEnd) onMeetingEnd();
          api.dispose();
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      // Remove the script tag
      const existingScript = document.head.querySelector('script[src="https://8x8.vc/vpaas-magic-cookie-4c5314bc4de84c7a8decf969e272f3d1/external_api.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [roomName, displayName, isTeacher, onMeetingEnd]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
      <div ref={jitsiContainerRef} className="w-full h-full" style={{ height: '600px' }} />
    </div>
  );
};

export default JitsiVideo;