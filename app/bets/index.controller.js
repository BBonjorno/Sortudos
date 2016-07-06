(function () {
    'use strict';

    angular
        .module('app')
        .controller('Bets.IndexController', Controller);

    function Controller(UserService, FlashService) {
        
        var vm = this;

        vm.user = null;
        vm.bets = null;
        
        initController();

        function initController() {

            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                if(vm.user != null)
                {
                    UserService.GetBets(vm.user._id).then(function (bets) {
                         vm.bets = bets;
                    });
                }
            });
        }
    }
})();