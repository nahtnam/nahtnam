'use client';

/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { navigationItems } from '../data/navigation';


export function Navigation() {
  const pathname = usePathname();


  return (
    <div className="bg-white text-black">
      <div className="navbar container mx-auto">
        <div className="navbar-start">
          <Link href="/">
            <span className='text-2xl font-bold'>nahtnam</span>
          </Link>
        </div>
        <div className="navbar-center" />
        <div className="navbar-end">
          <Menu as="div" className="dropdown dropdown-end">
            {({ open }) => (
              <>
                <Menu.Button
                  as="label"
                  tabIndex={0}
                  className={classNames('btn btn-square btn-ghost lg:hidden', open && 'btn-active')}
                >
                  <Bars3Icon className="h-6 w-6" />
                </Menu.Button>
                <Menu.Items
                  as="ul"
                  tabIndex={0}
                  className="menu menu-compact dropdown-content mt-3 p-2 gap-1 shadow bg-base-100 rounded-box w-52"
                >
                  {navigationItems.map(({ href, label, isExternal }) => (
                    <Menu.Item as="li" key={href}>
                      <Link href={href} {...(isExternal ? { target: "_blank", rel: "noreferrer"} : {}) } className={classNames(pathname === href && 'bg-black text-white')}>
                        {label}
                      </Link>
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </>
            )}
          </Menu>
          <ul className="menu menu-horizontal p-0 hidden lg:flex gap-2">
            {navigationItems.map(({ href, label, isExternal }) => (
              <li key={href}>
                <Link
                  href={href}
                  {...(isExternal ? { target: "_blank", rel: "noreferrer"} : {}) }
                  className={classNames('rounded-md hover:bg-black hover:text-white', pathname === href && 'bg-black text-white')}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
