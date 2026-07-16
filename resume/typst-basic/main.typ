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
  paper: "us-letter",
  margin: 0.4in,
  author-position: center,
  personal-info-position: center,
)

== Work Experience

#work(
  company: "Mercury",
  title: "Principal Software Engineer",
  location: "Remote",
  dates: dates-helper(start-date: "Jan 2026", end-date: "Present"),
)
- Lead *AI-DX* developer experience across engineering, product, and design.
- Own the shift from a Haskell monolith to *TypeScript micro-services* for future products.
- Lead two new products: a new vertical from scratch and an *AI-powered product* offering.

#work(
  company: "Mercury",
  title: "Staff Software Engineer",
  location: "Remote",
  dates: dates-helper(start-date: "May 2023", end-date: "Jan 2026"),
)
- Led a team to build a new marketing *Design System* with *Next.js*, unlocking millions in more efficient ad spend.
- Made mercury.com maintainable by marketing, legal, and compliance teams.
- Owned large shifts across the organization's frontend and backend stacks.

#work(
  company: "Mercury",
  title: "Engineering Manager",
  location: "Remote",
  dates: dates-helper(start-date: "Oct 2022", end-date: "May 2023"),
)
- Managed Growth engineering, a team of 8+, across multiple global timezones and performance management.
- Led projects spanning acquisition, activation, virality, and retention.
- Split a large team into more focused teams, then went heads-down to solve major acquisition issues.

#work(
  company: "Mercury",
  title: "Senior Software Engineer",
  location: "Remote",
  dates: dates-helper(start-date: "Nov 2021", end-date: "Oct 2022"),
)
- Built developer UX experiences that improved speed and efficiency for engineering and marketing teams.

#work(
  company: "Twingate",
  title: "Software Engineer",
  location: "Remote",
  dates: dates-helper(start-date: "Mar 2020", end-date: "Nov 2021"),
)
- As the primary frontend developer, worked with the VP of Design to rebuild the company's web application using *React*, *TypeScript*, *Next.js*, *Apollo*, and *Django*.

#work(
  company: "Lime",
  title: "Software Engineer",
  location: "San Francisco, CA",
  dates: dates-helper(start-date: "Oct 2019", end-date: "Mar 2020"),
)
- Streamlined firmware releases by automating approvals from C-level executives to operations teams using *Approval Donkey*, *Zapier*, *Active Admin*, and *webhooks*.
- Led SIM theft detection project reducing over \$500,000 in damages by assessing 250,000+ SIM cards and coordinating automated suspension with *Twilio*.

#work(
  company: "Lime, Rakuten/Ebates, Roambee, Card for Coin",
  title: "Software Engineering Internships",
  location: "",
  dates: dates-helper(start-date: "2015", end-date: "2019"),
)
- Shipped production features, automation, and pipelines with *React*, *TypeScript*, *Ruby on Rails*, *Python*, and *Scala*.

== Showcase

- *Mercury*: #link("https://mercury.com")[mercury.com] landing-page system for marketers; #link("https://mercury.com/command")[Command], an AI product for financial work.
- *Projects*: Emit.so, Generate Metadata, Frunk, PG-Bossman.
- *Stack*: AI SDK, MCP, RAG, agent loops, TypeScript, React, Next.js, Rails, Django, Postgres, Docker.

== Education

#generic-two-by-two(
  top-left: [*University of California, Santa Cruz*],
  top-right: [Sep 2017 #sym.dash.en Mar 2020],
  bottom-left: [#emph[B.S., Computer Science], Magna Cum Laude, GPA: 3.9],
  bottom-right: [#emph[Santa Cruz, CA]],
)
