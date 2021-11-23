// Class component -----------------------------------------------------------

import React, { Component } from 'react';
import './Example.css';


class Example extends Component {
  static defaultProps = {
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div className="Example">

      </div>
    );
  }
}

export default Example;


// Functional component ------------------------------------------------------

import React, { useState } from 'react';
import './Example.css';


function Example(props) {
  const [name, setName] = useState('');

  function updateMyState() {
    setName('foo');
  }

  return (
    <div className="Example">

    </div>
  );
}


export default Example;
