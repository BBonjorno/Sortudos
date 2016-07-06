(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller(UserService, FlashService) {
        var vm = this;

        vm.user = null;
        vm.saveBet = saveBet;
        
        initController();
        
        function initController() {

            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            
            vm.bet1 = Math.floor((Math.random() * 60) + 1);;
            vm.bet2 = Math.floor((Math.random() * 60) + 1);;
            vm.bet3 = Math.floor((Math.random() * 60) + 1);;

        }
        
        function saveBet() {

            var betParam =  [vm.bet1,vm.bet2,vm.bet3];

            UserService.SaveBet(vm.user._id,betParam)
                .then(function () {
                    FlashService.Success('Aposta salva com sucesso');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }
    }

})();