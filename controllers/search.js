cacheApp.controller('search', function($scope, $state, CacheService){
	
    $scope.wordMeaningData = [];
    $scope.evictedKeys = [];
    $scope.errorMsg = null;
    var arcCache;


    function List() {
        this.first = null
        this.last = null
        this.count = 0
    }

    function Item(key, value) {
        this.next = null
        this.prev = null
        this.list = null

        this.key = key
        this.value = value
    }

    Item.prototype.remove = function () {
        if (!this.list) return
        this.list.count--

        if (this.prev) {
            this.prev.next = this.next
        }

        if (this.next) {
            this.next.prev = this.prev
        }

        if (this.list.first === this) {
            this.list.first = this.next
        }

        if (this.list.last === this) {
            this.list.last = this.prev
        }

        this.prev = null
        this.list = null
    }

    Item.prototype.prependTo = function (list) {
        console.log(list);
        this.remove()

        if (list.first) {
            this.next = list.first
            this.next.prev = this
        }

        this.list = list
        this.list.count++

            list.first = this
        list.last = list.last || this
    }

    function arc(limit) {
        this.p = 0;
        this.c = limit;

        this.t1 = new List();
        this.b1 = new List();
        this.t2 = new List();
        this.b2 = new List();

        this.keyToItem = {}
    }

    function ghostHit(item){
        arcCache._replace(item)
        console.log(this);
        item.prependTo(arcCache.t2) 
    }

    function cacheMiss(item){
        console.log(item);
        console.log(arcCache);
        item.prependTo(arcCache.t1)
    }


    var addToEvictedKey = function(key){
        CacheService.addToEvictedKey(key).success(function(response){
            getEvictedKeys();       
        }).error(function(error){
            
        })
    }


    arc.prototype.get = function (key) {
        var item = arcCache.keyToItem[key];

        if (!item) {
            item = new Item(key, null);
            arcCache.keyToItem[key] = item;
        }

        var delta;

        switch (item.list) {
            case arcCache.t1:
            case arcCache.t2:
                $scope.errorMsg = "Congrats!! You got a cache hit.";
                item.prependTo(arcCache.t2);
                $scope.errorMsg += " Meaning is '" + item.value +"'.";
                break;
            case arcCache.b1:
                $scope.errorMsg = "Congrats!! You got a cache hit, that too a ghost one.";
                delta = arcCache.b1.count >= arcCache.b2.count ? 1 : arcCache.b2.count / arcCache.b1.count;
                arcCache.p = Math.min(
                    arcCache.p + delta,
                    arcCache.c
                );
                item.value; // DB Query;
                arcCache._replace(item);
                item.prependTo(arcCache.t2);
                break;
            case arcCache.b2:
                $scope.errorMsg = "Congrats!! You got a cache hit, that too a ghost one.";
                delta = arcCache.b2.count >= arcCache.b1.count ? 1 : arcCache.b1.count / arcCache.b2.count
                arcCache.p = Math.max(
                    arcCache.p - delta,
                    0
                )
                CacheService.get(key).success(function(response){
                    if(response && response.status == 'FOUND'){
                        item.value = response.meaning;
                        ghostHit(item);
                        $scope.errorMsg += " Meaning is '" + item.value +"'.";
                    }       
                }).error(function(error){
                    
                })
                break;
            default:
            $scope.errorMsg = "Oops!! This seems a cache miss.";
                if (arcCache.c === arcCache.t1.count + arcCache.b1.count) {
                    if (arcCache.t1.count < arcCache.c) {
                        if (arcCache.b1.last) {
                            delete arcCache.keyToItem[arcCache.b1.last.key]
                            arcCache.b1.last.remove()
                        }
                        arcCache._replace(item)
                    } else {
                        if (arcCache.t1.last) {
                            delete arcCache.keyToItem[arcCache.t1.last.key]
                            arcCache.t1.last.remove()
                        }
                    }
                } else {
                    if (arcCache.t1.count + arcCache.t2.count + arcCache.b1.count + arcCache.b2.count >= arcCache.c) {
                        if (arcCache.t1.count + arcCache.t2.count + arcCache.b1.count + arcCache.b2.count === 2 * arcCache.c) {
                            if (arcCache.b2.last) {
                                alert("Cache is full now. Evicting the word "+arcCache.b2.last.key);
                                addToEvictedKey(arcCache.b2.last.key);
                                delete arcCache.keyToItem[arcCache.b2.last.key]
                                arcCache.b2.last.remove()
                            }
                        }
                        arcCache._replace(item)
                    }
                }
                CacheService.get(key).success(function(response){
                    if(response && response.status == 'FOUND'){
                        item.value = response.meaning;//mainStorage.get(key) 
                        cacheMiss(item);
                        $scope.errorMsg += " Word found in database. Meaning is '" + item.value +"'."; 
                    }else{
                        $scope.errorMsg += " Word not found in database.";
                    }      
                }).error(function(error){
                    
                })
        }
        return item.value;
    }

    arc.prototype._replace = function (item) {
        if (
            arcCache.t1.count > 0 &&
            (
                (arcCache.t1.count > arcCache.p) ||
                (item.list === arcCache.b2 && arcCache.t1.count === arcCache.p)
            )
        ) {
            arcCache.t1.last.value = null
            arcCache.t1.last.prependTo(arcCache.b1)
        } else {
            arcCache.t2.last.value = null
            arcCache.t2.last.prependTo(arcCache.b2)
        }
    }


    function isCacheIntialized() {
        return (arcCache != null);
    }

    function createCache() {
        console.log("Creating Cache.");
        var limit = 5;
        arcCache = new arc(limit);
    }


    $scope.search = function(wordToSearch){
        if (!isCacheIntialized()) {
            console.log("Cache Not yet Initialized. Creating now.");
            createCache();
        }
        console.log(arcCache);
        $scope.errorMsg = null;
        if(!wordToSearch || wordToSearch.trim().length == 0){
            $scope.errorMsg = "Please enter a word to search.";
            return;
        }
        arcCache.get(wordToSearch);
    }


    var getEvictedKeys = function(){
        CacheService.getEvictedKeys().success(function(response){
            $scope.evictedKeys = response;
            console.log(response);
        }).error(function(error){
            
        })
    }


    var populateTable = function(){
        CacheService.getWordMeaningData().success(function(response){
            $scope.wordMeaningData = [];
            for(word in response){
                var data = {};
                data.word = word;
                data.meaning = response[word];
                $scope.wordMeaningData.push(data);
            }
            getEvictedKeys();
        }).error(function(error){
            
        })
    }


    $scope.initializeSystem = function(){
        arcCache = null;
        CacheService.initialize().success(function(response){
            if(response && response.status == 'SUCCESS'){
                populateTable();
            }else if(response && response.status == 'FAILURE'){
                alert("Data initialization failed. Please try again.");
            }
        }).error(function(error){
            alert("Error occured in fetchin data. Please try again.");
        })
    }

});