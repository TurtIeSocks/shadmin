import { Menu } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import GithubLogo from "/img/github-mark-white.svg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="py-4 lg:py-10">
      <Container>
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center gap-x-2">
            <a href="/" aria-label="Home">
              <Logo className="h-8 w-auto" />
            </a>
            <h1 className="text-xl md:text-2xl font-extrabold leading-none tracking-tight text-slate-900 font-heading">
              shadmin
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-x-0 lg:gap-x-2 xl:gap-x-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="https://shadmin.turtlesocks.dev/docs/install">
              Doc
            </NavLink>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-md inline-block rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                Demos
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuItem className="m-1">
                  <a
                    href="https://shadmin.turtlesocks.dev/demo"
                    target="_blank"
                    className="flex-1"
                    rel="noopener noreferrer"
                  >
                    E-Commerce
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="m-1">
                  <a
                    href="https://marmelab.com/atomic-crm-demo/"
                    target="_blank"
                    className="flex-1"
                    rel="noopener noreferrer"
                  >
                    CRM
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <NavLink href="#pricing">Pricing</NavLink>
            <Button asChild>
              <a
                href="https://github.com/TurtIeSocks/shadmin"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={GithubLogo}
                  alt="Github"
                  className="inline h-4 w-auto"
                />{" "}
                Star us on Github!
              </a>
            </Button>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" color="black">
                  <Menu className="size-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuItem className="m-1">
                  <a href="#features" className="flex-1">
                    Features
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="m-1">
                  <a
                    href="https://shadmin.turtlesocks.dev/docs/install"
                    className="flex-1"
                  >
                    Doc
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="m-1">
                  <a
                    href="https://shadmin.turtlesocks.dev/demo"
                    target="_blank"
                    className="flex-1"
                    rel="noopener noreferrer"
                  >
                    Demo E-Commerce
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="m-1">
                  <a
                    href="https://marmelab.com/atomic-crm-demo/"
                    target="_blank"
                    className="flex-1"
                    rel="noopener noreferrer"
                  >
                    Demo CRM
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="m-1">
                  <a href="#pricing" className="flex-1">
                    Pricing
                  </a>
                </DropdownMenuItem>
                <div className="w-full p-1">
                  <Button asChild className="w-full">
                    <a
                      href="https://github.com/TurtIeSocks/shadmin"
                      target="_blank"
                      className="flex-1"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={GithubLogo}
                        alt="Github"
                        className="inline h-4"
                      />{" "}
                      Star us on Github!
                    </a>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </Container>
    </header>
  );
}
