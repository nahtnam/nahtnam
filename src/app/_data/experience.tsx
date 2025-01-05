import type { ReactNode } from "react";
import { FaUniversity } from "react-icons/fa";
import { GiTreeBeehive } from "react-icons/gi";
import { LuBitcoin, LuPiggyBank } from "react-icons/lu";
import { MdElectricScooter, MdVpnLock } from "react-icons/md";
import { SiRakuten } from "react-icons/si";

export type ExperienceCardData = {
  company: string;
  roles: string[];
  url: string;
  imageSrc?: string;
  startDate: Date;
  endDate: Date | null;
};
export const experienceCards = [
  {
    company: "Mercury",
    roles: ["Staff Software Engineer", "Engineering Manager"],
    url: "https://mercury.com/",
    startDate: new Date(2021, 11, 29),
    endDate: null,
  },
  {
    company: "Twingate",
    roles: ["Software Engineer"],
    url: "https://twingate.com/",
    startDate: new Date(2020, 3, 1),
    endDate: new Date(2021, 11, 21),
  },
  {
    company: "Lime",
    roles: ["Software Engineer"],
    startDate: new Date(2019, 10, 1),
    endDate: new Date(2020, 3, 1),
    url: "https://www.li.me/",
    imageSrc:
      "https://img.li.me/content/uploads/HERO_2022-04-19-234518_eqga.png?auto=compress&crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&h=630&q=80&w=1200&s=20a642dccf084e7066e240d86be26f6c",
  },
] satisfies ExperienceCardData[];

type Resume = {
  icon: ReactNode;
  startDate: Date;
  endDate: Date | null;
  title: string;
  company: string;
  collapse?: boolean;
  iconClass: string;
};

export const resume = [
  {
    icon: <LuPiggyBank />,
    iconClass: "bg-[#5266eb] text-white",
    company: "Mercury",
    title: "Staff Software Engineer",
    endDate: null,
    startDate: new Date(2024, 3, 7),
  },
  {
    icon: <LuPiggyBank />,
    iconClass: "bg-[#5266eb] text-white",
    company: "Mercury",
    title: "Senior Software Engineer",
    endDate: new Date(2024, 3, 7),
    startDate: new Date(2023, 5, 30),
    collapse: true,
  },
  {
    icon: <LuPiggyBank />,
    iconClass: "bg-[#5266eb] text-white",
    company: "Mercury",
    title: "Engineering Manager",
    endDate: new Date(2023, 5, 30),
    startDate: new Date(2022, 10, 7),
  },
  {
    icon: <LuPiggyBank />,
    iconClass: "bg-[#5266eb] text-white",
    company: "Mercury",
    title: "Senior Software Engineer",
    endDate: new Date(2022, 10, 7),
    startDate: new Date(2021, 11, 29),
  },
  {
    icon: <MdVpnLock />,
    iconClass: "bg-[#eef35f] text-black",
    company: "Twingate",
    title: "Software Engineer",
    endDate: new Date(2021, 11, 21),
    startDate: new Date(2020, 3, 1),
  },
  {
    icon: <MdElectricScooter />,
    iconClass: "bg-[#00dd00] text-black",
    company: "Lime",
    title: "Software Engineer",
    endDate: new Date(2020, 3, 1),
    startDate: new Date(2019, 10, 1),
  },
  {
    icon: <LuPiggyBank />,
    iconClass: "bg-[#00dd00] text-black",
    company: "Lime",
    title: "Software Engineering Intern",
    endDate: new Date(2019, 9, 1),
    startDate: new Date(2019, 6, 1),
    collapse: true,
  },
  {
    icon: <FaUniversity />,
    iconClass: "bg-[#1569a9] text-white",
    company: "UC Santa Cruz",
    title: "Researcher",
    endDate: new Date(2019, 6, 1),
    startDate: new Date(2017, 10, 1),
  },
  {
    icon: <SiRakuten />,
    iconClass: "bg-[#8529cd] text-white",
    company: "Rakuten",
    title: "Software Engineering Intern",
    endDate: new Date(2018, 9, 1),
    startDate: new Date(2018, 6, 1),
  },
  {
    icon: <GiTreeBeehive />,
    iconClass: "bg-[#fdb933] text-black",
    company: "Roambee",
    title: "Software Engineering Intern",
    endDate: new Date(2016, 8, 31),
    startDate: new Date(2016, 7, 1),
  },
  {
    icon: <LuBitcoin />,
    iconClass: "bg-[#ffd600] text-black",
    company: "Foldapp",
    title: "Software Engineering Intern",
    endDate: new Date(2015, 8, 1),
    startDate: new Date(2015, 6, 1),
  },
] satisfies Resume[];
