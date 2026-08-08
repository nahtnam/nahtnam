#import "./template.typ": *

#show: resume.with(
  author: "Manthan Mallikarjun",
  location: "California",
  email: "me@nahtnam.com",
  github: "github.com/nahtnam",
  linkedin: "linkedin.com/in/nahtnam",
  personal-site: "nahtnam.com",
  accent-color: "#000000",
  font: "New Computer Modern",
  font-size: 10.5pt,
  paper: "us-letter",
  margin: 0.5in,
  author-position: center,
  personal-info-position: center,
)

== Work Experience

#work(
  title: "Mercury",
  location: "Remote",
  dates: dates-helper(start-date: "Nov 2021", end-date: "Present"),
)
#pad(left: 10pt)[
  #work(
    title: "Principal Software Engineer, Applied AI",
    dates: dates-helper(start-date: "Jan 2026", end-date: "Present"),
  )
  - Designed and built the TypeScript agent harness for #link("https://mercury.com/blog/security-principles-command")[*Mercury Command*], an LLM-powered AI agent, replacing its Haskell predecessor; led 8 engineers from prototype to an *all-customer rollout in 10 weeks*.
  - Built a dynamically loaded, team-owned skill system that enables *10+ product teams* to add capabilities without changing Command's core runtime.
  - Designed financial-action guardrails where *the model proposes, product backends enforce, and users authorize*; execution occurs outside the model and remains traceable, with *zero unauthorized executions across 20,000+ completed actions*.
  - Seven weeks after launch, *80,000+ users* had used Command across 65 workflows; 3,000+ user-approved payment and transfer submissions totaled *\$22M+*.
  - Advanced from IC2 to Principal in four years, becoming one of *6 Principals among 300 engineers*.

  #v(2pt)
  #work(
    title: "Staff Software Engineer",
    dates: dates-helper(start-date: "May 2023", end-date: "Jan 2026"),
  )
  - Owned Mercury's AI developer experience for *300 engineers*: rolled out Claude and Cursor, trained teams, and deployed AI review on every pull request.
  - Secured CEO and CPO backing for a six-month #link("https://mercury.com")[mercury.com] rebuild; led 3 engineers to deliver a Next.js/CMS platform spanning 150+ pages and variants, serving millions of monthly page views, and cutting launch time from *two weeks to under a day*.
  - Designed a typed MJML/TypeScript email service and compliance preview system; coordinated a six-month migration across 15+ teams and *500+ templates* supporting *millions of daily sends*, with no production incidents during migration.

  #v(2pt)
  #work(
    title: "Engineering Manager",
    dates: dates-helper(start-date: "Oct 2022", end-date: "May 2023"),
  )
  - Managed *8 engineers* across acquisition, activation, and retention; owned performance management and delivery, then reorganized Growth into two focused teams as Mercury scaled.

  #v(2pt)
  #work(
    title: "Software Engineer / Senior Software Engineer",
    dates: dates-helper(start-date: "Nov 2021", end-date: "Oct 2022"),
  )
  - Promoted twice from IC2 to IC4 in 11 months.
]

#work(
  company: "Twingate",
  title: "Software Engineer",
  location: "Remote",
  dates: dates-helper(start-date: "Mar 2020", end-date: "Nov 2021"),
)
- Served as Twingate's primary frontend engineer, owning onboarding, administration, and the zero-trust policy builder; set the React/TypeScript architecture and grew the frontend team from one to three engineers.

#work(
  company: "Lime",
  title: "Software Engineer",
  location: "San Francisco, CA",
  dates: dates-helper(start-date: "Oct 2019", end-date: "Mar 2020"),
)
- Partnered with Twilio's product team to build continuous risk monitoring for *250,000+ SIM cards*; the program was estimated to have avoided *\$500,000+ in theft losses*.
- Built firmware rollout infrastructure that reconciled city-specific rules and configuration as scooters moved between markets, with approval workflows for safe releases.

#work(
  company: "Lime, Rakuten/Ebates, Roambee, Card for Coin",
  title: "Engineering Internships",
  dates: dates-helper(start-date: "2015", end-date: "2019"),
)

== Selected Writing & Research

- *Author*, #link("https://mercury.com/blog/security-principles-command")[#emph[Our security principles behind Command]] - Mercury, 2026.
- *Co-author*, #link("https://doi.org/10.1145/3357223.3365442")[#emph[Vote Them Out: Detecting and Eliminating Byzantine Peers]] - poster accepted at ACM SoCC, 2019.

== Education

#generic-two-by-two(
  top-left: [*University of California, Santa Cruz*],
  top-right: [Sep 2017 #sym.dash.en Mar 2020],
  bottom-left: [#emph[B.S. in Computer Science], magna cum laude],
  bottom-right: [#emph[Santa Cruz, CA]],
)
