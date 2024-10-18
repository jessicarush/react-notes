# use

[use](https://react.dev/reference/react/use) is a new is a React API that lets you read the value of a resource like a Promise or context. It's a function that accepts a promise conceptually similar to `await`. `use` handles the promise returned by a function in a way that is compatible with components, hooks, and Suspense.

In other words, it allows you to pass a Promise from a Server Component to a Client Component and resolve it in the Client Component. This way you can avoid blocking the rendering of the Server Component with await.

app/page.tsx:

```tsx
import { getColor } from '@/app/_lib/data';
import { Suspense } from 'react';
import RandomColor from './random-color';

export default async function ServerSide() {
  // const colorPromise: Color = await getColor();
  const colorPromise = getColor();

  return (
    <main>
      <p>React use() API.</p>
      <Suspense>
        <RandomColor promisedColor={colorPromise} />
      </Suspense>
    </main>
  );
}
```

app/random-color.tsx:

```tsx
'use client';

import { use } from "react";
import type { Color } from "@/app/_lib/definitions";

type Props = {
  children?: React.ReactElement;
  // promisedColor: Color;
  promisedColor: Promise<Color>;
};

export default function RandomColor({promisedColor}: Props) {
  const color = use(promisedColor);

  return (
    <div>
      <p>
        color:{' '}
        <span style={{ color: color.value }}>
          {color.name} {color.value}
        </span>
      </p>
    </div>
  );
}
```

React's use API is still in experimental mode.