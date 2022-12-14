import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData, useCatch, useTransition } from "@remix-run/react";
import JokeItem from "~/components/JokeItem";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

function validateJokeName(name: string) {
  if (name.length < 3) {
    return `Joke's name is too short`;
  }
}

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return `Joke's content is too short`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

const badRequest = (data: ActionData) => {
  return json(data, {
    status: 400,
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);

  if (!userId) {
    throw new Response("Unauthorized", {
      status: 401,
    });
  }

  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request); // if request cookie not include userId, user be redirect to login page immediately and end this function

  const form = await request.formData();
  const name = form.get("name");
  const content = form.get("content");

  if (typeof name !== "string" || typeof content !== "string") {
    return badRequest({ formError: "Form not submitted correctly" });
  }

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };
  const fields = { name, content };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
    });
  }
  const newJoke = await db.joke.create({
    data: {
      ...fields,
      jokesterId: userId,
    },
  });

  return redirect(`/jokes/${newJoke.id}`);
};

export default function NewJokesRoute() {
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  if (transition.submission) {
    const name = transition.submission.formData.get("name");
    const content = transition.submission.formData.get("content");
    if (
      typeof name === "string" &&
      typeof content === "string" &&
      !validateJokeName(name) &&
      !validateJokeContent(content)
    ) {
      return <JokeItem joke={{ name, content }} canDelete={false} />;
    }
  }

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name}
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-errormessage={actionData?.fieldErrors?.name ? "name-error" : undefined}
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              name="content"
              defaultValue={actionData?.fields?.content}
              aria-invalid={Boolean(actionData?.fieldErrors?.content) || undefined}
              aria-errormessage={actionData?.fieldErrors?.content ? "content-error" : undefined}
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p className="form-validation-error" role="alert" id="content-error">
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>

        {actionData?.formError ? (
          <div>
            <p className="form-validation-error" role="alert">
              {actionData.formError}
            </p>
          </div>
        ) : null}
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  return <div className="error-container">Something unexpected went wrong. Sorry about that.</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }
}
