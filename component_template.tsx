// Functional component ------------------------------------------------------

import React, { useState, useEffect } from 'react';
import './Example.css';

type ExampleProps = {
  message: string;
  color: string;
}

export default function Example(props: ExampleProps) {
  // const {} = props;
  const [name, setName] = useState('');

  useEffect(() => {
    console.log('mount');
    return () => {
      console.log('cleanup');
    }
  }, []);

  return (
    <div className="Example">
      {/* Here's my comment */}
    </div>
  );
}
