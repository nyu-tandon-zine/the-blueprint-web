// ----------------------------------------------------------------
// The zine team, shown at the bottom of /contributors.
//
// Each semester: add a new entry at the TOP of MASTHEADS (the first one is
// what the site shows). Keep old ones — the archive can use them later.
// ----------------------------------------------------------------

export interface MastheadRole {
  title: string
  people: string[]
}

export interface MastheadGroup {
  heading: string
  roles: MastheadRole[]
}

export interface Masthead {
  semester: string   // matches issues.semester, e.g. "Spring 2026"
  groups: MastheadGroup[]
}

export const MASTHEADS: Masthead[] = [
  {
    semester: 'Spring 2026',
    groups: [
      {
        heading: 'Project Managers',
        roles: [
          { title: 'Overall', people: ['Antonia Ang'] },
          { title: 'Editorial', people: ['Konstantina Sezenia', 'Nikhita Bolineli'] },
          { title: 'Design', people: ['Gemma Liang', 'Leah Tewolde'] },
          { title: 'Web Development', people: ['Garrik Vertsaman', 'Xufei (Felix) Zhang'] },
        ],
      },
      {
        heading: 'Staff',
        roles: [
          {
            title: 'Editorial Team',
            people: [
              'Perry Adofo',
              'Antonia Ang',
              'Casey Dalicandro',
              'Vaishnavi Girish',
              'Tyler Mak',
              'Emma Ozdogan',
              'Carter Scott',
            ],
          },
          {
            title: 'Design Team',
            people: [
              'Bersu Berker',
              'Srividhya Chandramouleeswaran',
              'Stacey Chen',
              'Jake Giuliana',
              'Ellie Lennon',
              'Connor Ng',
              'Ella Sachs',
              'Eric Shao',
            ],
          },
          {
            title: 'Web Development Team',
            people: [
              'Srividhya Chandramouleeswaran',
              'Adam Kobor',
              'Adithya Somashekhar',
            ],
          },
        ],
      },
    ],
  },
]

export const currentMasthead: Masthead | undefined = MASTHEADS[0]
