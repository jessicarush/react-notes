// Class component -----------------------------------------------------------

// import React, { Component } from 'react';
// import './Example.css';


// class Example extends Component {
//   static defaultProps = {
//   };
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }
//   render() {
//     return (
//       <div className="Example">

//       </div>
//     );
//   }
// }

// export default Example;


// Functional component ------------------------------------------------------

import React, { useState, useEffect } from 'react';
import './Example.css';


export default function Example(props) {
  // props
  // const {} = props;
  // state
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
