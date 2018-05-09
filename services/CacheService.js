cacheApp.factory('CacheService', function ($timeout, $http, $state) {
  
    self = {};

    self.get = function(key){
        return $http({
            method: "get",
            url: "../arc/server/index.php/key",
            params: {
                word:key
            },
            timeout: 8000,
            headers:{} 
        })
    }

    self.initialize = function(){
       return $http({
            method: "post",
            url: "../arc/server/index.php/initializeDb",
            data: {
            },
            timeout: 8000,
            headers:{} 
        }) 
    }


    self.getWordMeaningData = function(){
        return $http({
            method: "get",
            url: "../arc/server/index.php/allKeyValues",
            params: {
            },
            timeout: 8000,
            headers:{} 
        })
    }

    self.getEvictedKeys = function(){
        return $http({
            method: "get",
            url: "../arc/server/index.php/allEvictedkeys",
            params: {
            },
            timeout: 8000,
            headers:{}  
        })      
    }


    self.addToEvictedKey = function(key){
        return $http({
            method: "post",
            url: "../arc/server/index.php/evictedKey",
            data: {
                word:key
            },
            timeout: 8000,
            headers:{}  
        })      
    }         
    return self;

})