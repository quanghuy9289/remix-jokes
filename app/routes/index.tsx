import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import styledUrl from "~/styles/index.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styledUrl }];
};

export const meta: MetaFunction = () => {
  return {
    title: "Remix: So great, it's funny | Home",
    description: "Remix jokes app. Learn Remix and laugh at the same time!",
  };
};

export default function IndexRoute() {
  return (
    <div className="container">
      <div className="content">
        <h1>
          Remix <span>Jokes!</span>
        </h1>

        <nav>
          <ul>
            <li>
              <Link to="jokes">Read Jokes</Link>
            </li>
            <li>
              <Link to="jokes.rss">Read RSS Feed</Link>
            </li>
          </ul>
        </nav>
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
      </div>
    </div>
  );
}
