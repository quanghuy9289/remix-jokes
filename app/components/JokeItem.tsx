import type { Joke } from "@prisma/client";
import { Form, Link } from "@remix-run/react";

type JokeDisplay = {
  joke: Pick<Joke, "content" | "name">;
  canDelete?: boolean;
};
export default function JokeItem({ joke, canDelete = true }: JokeDisplay) {
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to=".">{joke.name} Permalink</Link>
      <Form method="post">
        <input type="hidden" name="_method" value="delete" />
        <br />
        <button type="submit" className="button" disabled={!canDelete}>
          Delete
        </button>
      </Form>
    </div>
  );
}
