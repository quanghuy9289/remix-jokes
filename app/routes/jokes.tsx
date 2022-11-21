import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";

import stylesUrl from "~/styles/jokes.css";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  jokeListItems: Array<{ id: string; name: string }>;
};

// this loader method will be re-called when link to nested route
export const loader: LoaderFunction = async ({ request }) => {
  const jokeListItems = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  const user = await getUser(request);

  const data: LoaderData = { user, jokeListItems };
  return json(data);
};

export default function JokesRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form method="post" action="/logout">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
              {/* NOT USE: link will call loader function in logout.tsx as GET request, then we can not clear session in cookie, because we don't have request object ??? 
              => loader still have request object => use this also well
               <Link to="/logout">Logout</Link> */}
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            {data.jokeListItems ? (
              <>
                <Link to=".">Get a random joke</Link>
                <p>Here are a few more jokes to check out:</p>
                <ul>
                  {data.jokeListItems.map((joke) => (
                    <li key={joke.id}>
                      <Link to={joke.id} prefetch="intent">
                        {joke.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <Link to="new" className="button">
              Add your own
            </Link>

            <p>
              <Link to="/jokes.rss">Read RSS Feed</Link>
            </p>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
