import * as React from 'react';
import _ from 'lodash';
const {PropTypes} = React;

import createListenerCollection from './tools/createListenerCollection';

import {immSet} from './tools/immutableUtils';

const defaultFieldMeta = {
  changed: false,
  error: false,
  focused: false,
};

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
      this.meta = {};
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
        subscribe: (model, func) => {
          let value = this.PWForm.getValue(model);
          return this.listeners.subscribe(() => {
            let nextValue = this.PWForm.getValue(model);
            if (value !== nextValue) {
              value = nextValue;
              func(value);
            }
          });
        },
        getMeta: (model) => {
          const path = `${this.props.model}.${model}`;
          return this.context.PWForm.getMeta(path);
        },
        setMeta: (model, metaUpdate) => {
          const path = `${this.props.model}.${model}`;
          this.context.PWForm.setMeta(path, metaUpdate);
        },
        getValue: (model) => {
          const path = `${this.props.model}.${model}`;
          return this.context.PWForm.getValue(path);
        },
        setValue: (model, value) => {
          const path = `${this.props.model}.${model}`;
          this.context.PWForm.setValue(path, value);
        }
      };
    }
    else {
      this.PWForm = {
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
        getMeta: (model) => {
          return this.meta[model] || defaultFieldMeta;
        },
        setMeta: (model, metaUpdate) => {
          this.meta[model] = {
            ...defaultFieldMeta,
            ...this.meta[model],
            ...metaUpdate
          };
          console.log(this.values, this.meta[model]);
          this.values = immSet(this.values, model, _.get(this.values, model));
          this.listeners.notify();
        },
        getValue: (model) => {
          return _.get(this.values, model);
        },
        setValue: (model, value) => {
          this.values = immSet(this.values, model, value);
          this.PWForm.setMeta(model, {changed: true});
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
    const values = this.context.PWForm.getValue(this.props.model);
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
      value: this.context.PWForm.getValue(props.model)
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
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
    this.context.PWForm.setValue(this.props.model, e.target.value);
  }

  handleFocus() {
    this.context.PWForm.setMeta(this.props.model, {focused: true});
  }

  handleBlur({target: {value}}) {
    const update = {focused: false};
    if (Array.isArray(this.props.validators)) {
      update.error = this.runValidators(value);
    }
    this.context.PWForm.setMeta(this.props.model, update);
  }

  runValidators(value) {
    const {length} = this.props.validators;
    for (let i = 0; i < length; i++) {
      let res = this.props.validators[i](value);
      if (res) {
        return res;
      }
    }
    return false;
  }

  render() {
    const meta = this.context.PWForm.getMeta(this.props.model);
    console.log(meta);
    return (
      <div>
        <span>{this.props.model}</span>
        <input type="text"
               onChange={this.handleChange}
               onFocus={this.handleFocus}
               onBlur={this.handleBlur}
               value={this.state.value}/>
        {meta.error && <div>{meta.error}</div>}
      </div>
    )
  }
}

//////////////////////////////////////////

const SubForm = Form;

export default class FormTest extends React.Component {
  render() {
    console.log('Form Render');
    const data = {
      name: 'John',
      email: 'qwe@qwe.com',
      addr1: {
        street: 'Lenina'
      },
      addr2: {
        street: 'Morskoi'
      },
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
        <InputText model="name" validators={[v => v === 'namee' && 'not namee!']}/>
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
