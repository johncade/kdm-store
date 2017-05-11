'use strict';

import angular from 'angular';
import LoginController from './login.controller';

export default angular.module('kdmApp.login', [])
  .controller('LoginController', LoginController)
  .name;
