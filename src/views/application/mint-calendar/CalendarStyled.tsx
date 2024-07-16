// material-ui
import { styled } from '@mui/material/styles';

const ExperimentalStyled = styled('div')(({ theme }) => ({
    width: '100%',
    marginLeft: -1,
    marginBottom: '-50px',

    // hide license message
    '& .fc-license-message': {
        display: 'none'
    },

    // basic style
    '& .fc': {
        '--fc-page-bg': theme.palette.background.paper,
        '--fc-bg-event-opacity': 1,
        '--fc-border-color': theme.palette.mode === 'dark' ? '#09080d' : theme.palette.primary.light,
        '--fc-daygrid-event-dot-width': '10px',
        '--fc-today-bg-color': theme.palette.mode === 'dark' ? 'rgba(36, 24, 47, 0.85)' : theme.palette.primary.light,
        '--fc-list-event-dot-width': '0px',
        '--fc-event-border-color': theme.palette.primary.dark,
        '--fc-now-indicator-color': theme.palette.error.main,
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.paper,
        fontFamily: theme.typography.fontFamily
    },

    // date text
    '& .fc .fc-daygrid-day-top': {
        display: 'grid',
        '& .fc-daygrid-day-number': {
            textAlign: 'center',
            marginTop: 12,
            marginBottom: 12
        }
    },

    // weekday
    '& .fc .fc-col-header-cell': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[50]
    },

    '& .fc .fc-col-header-cell-cushion': {
        color: theme.palette.grey[900],
        padding: 16,
        [theme.breakpoints.down('md')]: {
            padding: '8px 4px'
        }
    },

    // events
    '& .fc-direction-ltr .fc-daygrid-event.fc-event-end, .fc-direction-rtl .fc-daygrid-event.fc-event-start': {
        marginLeft: 4,
        marginBottom: 6,
        borderRadius: '.75rem',
        backgroundColor: '#3D1456',
        border: 'none',
        cursor: 'pointer'
    },

    '& .fc-h-event .fc-event-main': {
        // backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.dark,
        borderRadius: '.75rem',
        padding: 4,
        paddingLeft: 8
    },

    // popover when multiple events
    '& .fc .fc-more-popover': {
        border: 'none',
        borderRadius: '.75rem',
        zIndex: 9
    },

    '& .fc .fc-more-popover .fc-popover-body': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.grey[200],
        borderBottomLeftRadius: '.75rem',
        borderBottomRightRadius: '.75rem'
    },

    '& .fc .fc-popover-header': {
        padding: 12,
        borderTopLeftRadius: '.75rem',
        borderTopRightRadius: '.75rem',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.grey[200],
        color: theme.palette.mode === 'dark' ? theme.palette.dark.light : theme.palette.text.primary
    },

    // '& .fc-direction-ltr .fc-daygrid-event.fc-event-start, .fc-direction-rtl .fc-daygrid-event.fc-event-end': {
    //     marginLeft: 4,
    //     marginBottom: 6,
    //     borderRadius: '6px'
    // },

    // '& .fc-h-event': {
    //     border: '0px !important'
    // },

    // agenda view
    '& .fc-theme-standard .fc-list-day-cushion': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[100]
    },

    '.fc-list-event': {
        backgroundColor: '#3D1456'
    },

    // '& .fc .fc-day': {
    //     cursor: 'pointer'
    // },

    '& .fc .fc-timeGridDay-view .fc-timegrid-slot': {
        backgroundColor: theme.palette.background.paper
    },

    '& .fc .fc-timegrid-slot': {
        cursor: 'pointer'
    },

    '& .fc .fc-list-event:hover td': {
        cursor: 'pointer',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.grey[100]
    },

    '& .fc-timegrid-event-harness-inset .fc-timegrid-event, .fc-timegrid-event.fc-event-mirror, .fc-timegrid-more-link': {
        padding: 8,
        margin: 2
    }
}));

export default ExperimentalStyled;
