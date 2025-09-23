export const toastStyle = (success,error) => ({
        duration: 3000,
        position: 'bottom-left',
        style: {
          background: success ? '#10B981' : '#EF4444',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: success ? '#10B981' : '#EF4444',
        },
      })