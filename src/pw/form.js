import * as React from 'react';
import _ from 'lodash';
const {PropTypes} = React;

import {createListenerCollection} from './Subscription';

import {immSet} from './createSelector'

class Form extends React.Component {

  static propTypes = {
    values: PropTypes.object,
    model: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ])
  };

  static contextTypes = {
    PWForm: PropTypes.any,
  };

  static childContextTypes = {
    PWForm: PropTypes.any.isRequired,
  };

  static displayName = 'Form';

  componentWillMount() {
    this.isSubForm = this.props.hasOwnProperty('model');
    if (!this.isSubForm && !this.props.values) {
      throw new Error('Form needs model or values')
    }
    if (this.isSubForm) {
      if (!(this.context && this.context.PWForm)) {
        throw new Error('SubForm needs context');
      }
    }
    else {
      this.values = {
        ...this.props.values
      };
    }
    this.listeners = createListenerCollection();
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
          const path = `${this.props.model}.${model}`;
          let value = this.context.PWForm.getValues(path);
          return this.listeners.subscribe(() => {
            let nextValue = this.context.PWForm.getValues(path);
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

class Each extends React.Component {
  static contextTypes = {
    PWForm: PropTypes.any.isRequired,
  };

  render() {
    const values = this.context.PWForm.getValues(this.props.model);
    return (
      <Form model={this.props.model}>
        {values.map((_t, idx) => <Form key={idx} model={idx}>{this.props.children}</Form>)}
      </Form>
    );
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
        <span>{this.props.model}</span>
        <input type="text"
               onChange={this.handleChange}
               value={this.state.value}/>
      </div>
    )
  }
}

//////////////////////////////////////////

const SubForm = Form;

export default class FormTest extends React.Component {
  render() {
    console.log('Rorm Render');
    const data = {
      name: 'John',
      email: 'qwe@qwe.com',
      addr1: {street: 'Lenina'},
      addr2: {street: 'Morskoi'},
      users: [{
        login: 'qwe',
        pass: 'zxc'
      }, {
        login: 'rrr',
        pass: 'vvvv'
      }]
    };
    return (
      <Form values={data}>
        <InputText model="name"/>
        <InputText model="email"/>
        <SubForm model="addr1">
          <InputText model="street"/>
        </SubForm>
        <SubForm model="addr2">
          <InputText model="street"/>
        </SubForm>
        <Each model="users">
          <InputText model="login"/>
          <InputText model="pass"/>
        </Each>
      </Form>
    );
  }
}
