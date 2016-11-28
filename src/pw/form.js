import * as React from 'react';
import _ from 'lodash';
const {PropTypes} = React;

import {createListenerCollection} from './Subscription';

import {immSet} from './createSelector'

class Form extends React.Component {

  static propTypes = {
    values: PropTypes.object,
    model: PropTypes.string
  };

  static contextTypes = {
    PWForm: PropTypes.any,
  };

  static childContextTypes = {
    PWForm: PropTypes.any.isRequired,
  };

  static displayName = 'Form';

  componentWillMount() {
    this.isSubForm = this.context && this.context.PWForm && this.props.model;
    if (!this.isSubForm && !this.props.values) {
      throw new Error('Form needs model or values')
    }
    this.listeners = createListenerCollection();
    if (!this.isSubForm) {
      this.values = {
        ...this.props.values
      };
    }
    this.initContext();
  }

  componentDidMount() {
    if (this.isSubForm) {
      this.unsubscribe = this.context.PWForm.subscribe(this.props.model, this.listeners.notify);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.listeners.clear();
  }

  getChildContext() {
    return {
      PWForm: this.PWForm,
    };
  }

  initContext() {
    if (this.isSubForm) {
      this.PWForm = {
        getValues: (model) => {
          const path = `${this.props.model}.${model}`;
          return this.context.PWForm.getValues(path);
        },
        subscribe: (model, func) => {
          let value;
          return this.listeners.subscribe(() => {
            let nextValue = this.context.PWForm.getValues(`${this.props.model}.${model}`);
            if (value !== nextValue) {
              value = nextValue;
              func(value);
            }
          });
        },
        set: (model, value) => {
          const path = `${this.props.model}.${model}`;
          this.context.PWForm.set(path, value);
        }
      };
    }
    else {
      this.PWForm = {
        getValues: (model) => {
          return _.get(this.values, model);
        },
        subscribe: (model, func) => {
          let value;
          return this.listeners.subscribe(() => {
            const nextValue = this.values[model];
            if (value !== nextValue) {
              value = nextValue;
              func(value);
            }
          });
        },
        set: (model, value) => {
          this.values = immSet(this.values, model, value);
          this.listeners.notify();
        }
      };
    }
  }

  render() {
    const Component = this.isSubForm ? 'div' : 'form';
    return (
      <Component onSubmit={e => console.log(e)}>
        {this.props.children}
      </Component>
    )
  }
}

//////////////////////////////////////////

class InputText extends React.Component {
  static contextTypes = {
    PWForm: PropTypes.any.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      model: props.model,
      value: this.context.PWForm.getValues(props.model)
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = this.context.PWForm.subscribe(this.props.model, value => this.setState({value}));
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleChange(e) {
    this.context.PWForm.set(this.props.model, e.target.value);
  }

  render() {
    return (
      <div>
        <input type="text"
               onChange={this.handleChange}
               value={this.state.value}/>
      </div>
    )
  }
}

//////////////////////////////////////////

export default class FormTest extends React.Component {
  render() {
    console.log('Rorm Render');
    const data = {
      name: 'John',
      email: 'qwe@qwe.com',
      addr1: {street: 'Lenina'},
      addr2: {street: 'Morskoi'}
    };
    return (
      <Form values={data}>
        <InputText model="name"/>
        <InputText model="email"/>
        <Form model="addr1">
          <InputText model="street"/>
        </Form>
        <Form model="addr2">
          <InputText model="street"/>
        </Form>
      </Form>
    );
  }
}
