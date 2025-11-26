const WC_CONSTANTS = {
    PROJECT_STATUS: {
        COMING_SOON: 'coming_soon',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        ARCHIVED: 'archived'
    },

    CLIENT_PROJECT_STATUS: {
        PENDING: 'pending',
        ACTIVE: 'active',
        ON_HOLD: 'on_hold',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },

    INQUIRY_STATUS: {
        NEW: 'new',
        REVIEWING: 'reviewing',
        RESPONDED: 'responded',
        CONVERTED: 'converted',
        CLOSED: 'closed'
    },

    INQUIRY_PRIORITY: {
        LOW: 'low',
        NORMAL: 'normal',
        HIGH: 'high',
        URGENT: 'urgent'
    },

    USER_ROLES: {
        CLIENT: 'client',
        STAFF: 'staff',
        ADMIN: 'admin'
    },

    UPDATE_TYPES: {
        STATUS_CHANGE: 'status_change',
        MILESTONE: 'milestone',
        NOTE: 'note',
        FILE_UPLOAD: 'file_upload',
        COMMENT: 'comment'
    },

    LANGUAGES: {
        EN: { code: 'en', name: 'English', flag: '🇺🇸' },
        FR: { code: 'fr', name: 'Français', flag: '🇫🇷' },
        HT: { code: 'ht', name: 'Kreyòl', flag: '🇭🇹' },
        ES: { code: 'es', name: 'Español', flag: '🇪🇸' }
    },

    FILE_TYPES: {
        IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
    },

    MAX_FILE_SIZE: {
        IMAGE: 5 * 1024 * 1024,
        DOCUMENT: 10 * 1024 * 1024,
        GENERAL: 25 * 1024 * 1024
    },

    CURRENCIES: {
        USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
        EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
        HTG: { code: 'HTG', symbol: 'G', name: 'Haitian Gourde' },
        CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
    },

    OAUTH_PROVIDERS: {
        GOOGLE: 'google',
        GITHUB: 'github',
        FACEBOOK: 'facebook'
    },

    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        MAX_PAGE_SIZE: 100
    },

    STORAGE_KEYS: {
        LANG: 'wc_lang',
        THEME: 'wc_theme',
        AUTH_TOKEN: 'wc_auth_token'
    },

    ERROR_MESSAGES: {
        en: {
            GENERIC_ERROR: 'An error occurred. Please try again.',
            AUTH_REQUIRED: 'You must be logged in to perform this action.',
            PERMISSION_DENIED: 'You do not have permission to perform this action.',
            INVALID_INPUT: 'Please check your input and try again.',
            FILE_TOO_LARGE: 'File size exceeds maximum allowed size.',
            NETWORK_ERROR: 'Network error. Please check your connection.'
        },
        fr: {
            GENERIC_ERROR: 'Une erreur s\'est produite. Veuillez réessayer.',
            AUTH_REQUIRED: 'Vous devez être connecté pour effectuer cette action.',
            PERMISSION_DENIED: 'Vous n\'avez pas la permission d\'effectuer cette action.',
            INVALID_INPUT: 'Veuillez vérifier votre saisie et réessayer.',
            FILE_TOO_LARGE: 'La taille du fichier dépasse la taille maximale autorisée.',
            NETWORK_ERROR: 'Erreur réseau. Veuillez vérifier votre connexion.'
        },
        ht: {
            GENERIC_ERROR: 'Gen yon erè ki fèt. Tanpri eseye ankò.',
            AUTH_REQUIRED: 'Ou dwe konekte pou fè aksyon sa a.',
            PERMISSION_DENIED: 'Ou pa gen pèmisyon pou fè aksyon sa a.',
            INVALID_INPUT: 'Tanpri verifye sa w antre a epi eseye ankò.',
            FILE_TOO_LARGE: 'Gwosè fichye a depase gwosè maksimòm pèmèt la.',
            NETWORK_ERROR: 'Erè rezo. Tanpri verifye koneksyon w.'
        },
        es: {
            GENERIC_ERROR: 'Ocurrió un error. Por favor, inténtelo de nuevo.',
            AUTH_REQUIRED: 'Debe iniciar sesión para realizar esta acción.',
            PERMISSION_DENIED: 'No tiene permiso para realizar esta acción.',
            INVALID_INPUT: 'Por favor, verifique su entrada e inténtelo de nuevo.',
            FILE_TOO_LARGE: 'El tamaño del archivo excede el tamaño máximo permitido.',
            NETWORK_ERROR: 'Error de red. Por favor, verifique su conexión.'
        }
    },

    SUCCESS_MESSAGES: {
        en: {
            SAVED: 'Saved successfully!',
            SENT: 'Sent successfully!',
            DELETED: 'Deleted successfully!',
            UPDATED: 'Updated successfully!'
        },
        fr: {
            SAVED: 'Enregistré avec succès!',
            SENT: 'Envoyé avec succès!',
            DELETED: 'Supprimé avec succès!',
            UPDATED: 'Mis à jour avec succès!'
        },
        ht: {
            SAVED: 'Anrejistre avèk siksè!',
            SENT: 'Voye avèk siksè!',
            DELETED: 'Efase avèk siksè!',
            UPDATED: 'Mete ajou avèk siksè!'
        },
        es: {
            SAVED: '¡Guardado exitosamente!',
            SENT: '¡Enviado exitosamente!',
            DELETED: '¡Eliminado exitosamente!',
            UPDATED: '¡Actualizado exitosamente!'
        }
    }
};

const WCHelpers = {
    formatCurrency(amount, currency = 'USD') {
        const curr = WC_CONSTANTS.CURRENCIES[currency];
        if (!curr) return amount;
        
        return `${curr.symbol}${parseFloat(amount).toFixed(2)}`;
    },

    formatDate(date, locale = 'en') {
        const d = new Date(date);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        const localeMap = {
            en: 'en-US',
            fr: 'fr-FR',
            ht: 'fr-HT',
            es: 'es-ES'
        };
        
        return d.toLocaleDateString(localeMap[locale] || 'en-US', options);
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isValidPhone(phone) {
        const re = /^[\d\s\-\+\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    validateFile(file, type = 'GENERAL') {
        const maxSize = WC_CONSTANTS.MAX_FILE_SIZE[type];
        
        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'FILE_TOO_LARGE'
            };
        }
        
        return { valid: true };
    },

    getFileType(mimeType) {
        for (const [type, mimes] of Object.entries(WC_CONSTANTS.FILE_TYPES)) {
            if (mimes.includes(mimeType)) {
                return type;
            }
        }
        return 'OTHER';
    },

    getErrorMessage(key, lang = 'en') {
        return WC_CONSTANTS.ERROR_MESSAGES[lang]?.[key] || 
               WC_CONSTANTS.ERROR_MESSAGES.en[key] ||
               'An error occurred';
    },

    getSuccessMessage(key, lang = 'en') {
        return WC_CONSTANTS.SUCCESS_MESSAGES[lang]?.[key] || 
               WC_CONSTANTS.SUCCESS_MESSAGES.en[key] ||
               'Success!';
    },

    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    },

    truncate(text, length = 100, suffix = '...') {
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + suffix;
    },

    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `wc-notification wc-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('wc-notification-show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('wc-notification-show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
};

if (typeof window !== 'undefined') {
    window.WC_CONSTANTS = WC_CONSTANTS;
    window.WCHelpers = WCHelpers;
}
