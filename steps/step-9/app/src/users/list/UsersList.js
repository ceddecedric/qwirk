import UsersListController from './UsersListController'

// Directive definition of the the UsersListDirective.
class UsersListDirective {
  constructor() {
    angular.extend(this, {
      restrict         : 'E',
      scope            : {  users: '=', selected : '=', showDetails : '&onSelected' },
      templateUrl      : 'src/users/list/UsersList.html',
      bindToController : true,
      controllerAs     : '$ctrl',
      controller       : ['$scope', '$log', UsersListController]
    });

  }
}

export default UsersListDirective;