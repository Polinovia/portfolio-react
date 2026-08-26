// ─────────────────────────────────────────────
// Skills.jsx - Grid of skill icons, grouped by category
// ─────────────────────────────────────────────

import {
  SiReact,
  SiVuedotjs,
  SiJavascript,
  SiTypescript,
  SiHtml5,
  SiSass,
  SiNodedotjs,
  SiPhp,
  SiDocker,
  SiGit,
  SiPhpmyadmin,
  SiFigma,
  SiWordpress,
  SiGooglechrome,
} from 'react-icons/si'
import { TbBrandAdobePhotoshop } from 'react-icons/tb'

// ── Data ──────────────────────────────────────
// Each group has a title and a list of skills.
// Each skill has a name, an icon component, a
// background color, and the icon's brand color.
const SKILL_GROUPS = [
  {
    title: 'Frontend Development',
    skills: [
      { name: 'React', Icon: SiReact, bg: '#0b1220', color: '#61dafb' },
      { name: 'Vue.js', Icon: SiVuedotjs, bg: '#0f1f18', color: '#42b883' },
      { name: 'JavaScript', Icon: SiJavascript, bg: '#f7df1e', color: '#1a1a1a' },
      { name: 'TypeScript', Icon: SiTypescript, bg: '#3178c6', color: '#ffffff' },
      { name: 'HTML', Icon: SiHtml5, bg: '#e34f26', color: '#ffffff' },
      { name: 'SCSS', Icon: SiSass, bg: '#cc6699', color: '#ffffff' },
    ],
  },
  {
    title: 'Backend & Tools',
    skills: [
      { name: 'Node.js', Icon: SiNodedotjs, bg: '#0f2318', color: '#339933' },
      { name: 'PHP', Icon: SiPhp, bg: '#1c1e3a', color: '#8892bf' },
      { name: 'Docker', Icon: SiDocker, bg: '#0b1f33', color: '#2496ed' },
      { name: 'Git', Icon: SiGit, bg: '#20130f', color: '#f05032' },
      { name: 'phpMyAdmin', Icon: SiPhpmyadmin, bg: '#1a1c33', color: '#6c78af' },
    ],
  },
  {
    title: 'Design & Other',
    skills: [
      { name: 'Figma', Icon: SiFigma, bg: '#1e1626', color: '#a259ff' },
      { name: 'Photoshop', Icon: TbBrandAdobePhotoshop, bg: '#001e2b', color: '#31a8ff' },
      { name: 'WordPress', Icon: SiWordpress, bg: '#0d1b25', color: '#21759b' },
      { name: 'Chrome Extension', Icon: SiGooglechrome, bg: '#151f30', color: '#4285f4' },
    ],
  },
]

export default function Skills() {
  return (
    <div className="card">
      {SKILL_GROUPS.map((group, groupIndex) => (
        <div
          key={group.title}
          className="skill-group"
          style={{ animationDelay: `${groupIndex * 0.08}s` }}
        >
          <div className="skill-group-title">{group.title}</div>
          <div className="skill-row">
            {group.skills.map(skill => (
              <div key={skill.name} className="skill-item">
                <div
                  className="skill-icon"
                  style={{ background: skill.bg, color: skill.color }}
                >
                  <skill.Icon />
                </div>
                <span className="skill-name">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
