'use strict';
export const _serviceRegistry = {};

// simply provides a singular place where we register our services
// so we can reference them during the config phase
export const Service = (name, serviceObject) => {
  if(_serviceRegistry[name] && serviceObject) {
    throw new Error(`Naming conflict: a service with the name ${name} has already been registered.`);
  }

  if(_serviceRegistry[name]) return _serviceRegistry[name];
  
  _serviceRegistry[name] = serviceObject;
  return serviceObject;
}