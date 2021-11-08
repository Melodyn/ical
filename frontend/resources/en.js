export default {
  translation: {
    nav: {
      install: 'Install',
      help: 'Help',
      calendar: 'Calendar',
      settings: 'Settings',
      back: 'Back',
    },
    page: {
      calendar: {
        header: 'Events calendar',
        group: {
          calendar: {
            header: 'Events for {{daysCount}} days. Time\u00A0zone:\u00A0{{timezone}}',
          },
          action: {
            header: 'Actions with calendar',
            open: 'Open in your browser',
            subscribe: 'Subscribe to add events in your calendar',
            help: 'Open "Help" for more information',
          },
        },
      },
      settings: {
        header: 'App settings',
      },
      install: {
        header: 'Install to your community',
        appName: 'Google Calendar & community\u00A0widget',
        description: 'The application works with a public Google calendar, which is set by the community administrator. Calendar events are automatically displayed on the community home page if the widget is enabled.',
        group: {
          select: {
            description: 'You must select a community to\u00A0use\u00A0the\u00A0application:',
            button: 'Select community',
          },
        },
      },
      help: {
        header: 'Questions & answers',
        description: 'Here you can find instructions and answers to questions. If the information on this page was not enough, write to the application chat or create a Pull Request on Github.',
        group: {
          calendar: {
            header: 'Google calendar service',
            description: `If this is your first time using the Google Calendar service, see the detailed article with a demo of the interface. She will explain the basic mechanics.

Please note that some tasks are much more difficult to solve from mobile devices than from a computer.`,
            qa: [
              {
                question: 'How do I create a Google calendar?',
                answer: 'Go to the page calendar.google.com/calendar and in the left menu near the heading Other calendars, press + and Create calendar.',
              },
              {
                question: 'How do I make my Google calendar public?',
                answer: 'On the calendar.google.com/calendar page, in the drop-down menu to the right of the calendar name, go to Settings and Sharing - Access Permissions, check the Make public box and give permission to Access all event information',
              },
              {
                question: 'What types of events are synced from calendar?',
                answer: `Only 'Events'. This is a limitation on the part of Google, so Tasks and Reminders will not be visible to other people.

Also, please note that text formatting from events in the Google calendar is not supported on VKontakte at the application and widget levels. Therefore, try to create text descriptions without formatting, and insert links as plain text. Otherwise, it will lead to an unpleasant visual display on VK.`,
              },
            ],
          },
          app: {
            header: 'About app',
            description: 'Answers was here',
            qa: [
              // {
              //   question: '',
              //   answer: '',
              // },
              // {
              //   question: '',
              //   answer: '',
              // },
              // {
              //   question: '',
              //   answer: '',
              // },
            ],
          },
          external: {
            header: 'External systems',
            description: 'Answers was here',
            qa: [],
          },
        },
      },
    },
  },
};
