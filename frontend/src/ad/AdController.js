import parseVAST from 'iab-vast-parser'
 
export default class AdController {

    constructor(content) {
        this.preRollUrl = "http://pulse-demo.videoplaza.tv/proxy/distributor/v2?t=cat_preroll&tt=p&rt=vast_3.0";
        this.postRollUrl = "http://pulse-demo.videoplaza.tv/proxy/distributor/v2?t=cat_postroll&tt=po&rt=vast_3.0";
        this.preRollError = false;
        this.postRollError = false;
        this.maxFetchTime = 3000;
        this.play = true;
        this.videoType = "preRoll";
        this.content = content;

        this.preOrPostRoll(this.preRollUrl).then((value, error) => {
            if (typeof value === "object") {
                this.vastPreRoll = value._ads._contents[0]._creatives._contents[0]._linear._mediaFiles[0]._uri;;
            }
        }).catch(error => {
            this.preRollError = true;
        });
        this.preOrPostRoll(this.postRollUrl).then((value, error) => {
            if (typeof value === "object") {
                this.vastPostRoll = value._ads._contents[0]._creatives._contents[0]._linear._mediaFiles[0]._uri;;   
            }
        }).catch(error => {
            this.postRollError = true;
        }); 
    }

    setPlay(play) {
        if (typeof play === "boolean") this.play = play;
    }

    getPlay() {
        return this.play;
    }

    getContent() {
        return this.content;
    }

    setVideoType(videoType) {
        if (typeof videoType === "string") this.videoType = videoType;
    }

    getVideoType() {
        return this.videoType;
    }

    setSource(videoSource) {
        if (typeof this.vastPreRoll === "string") {
            
            return this.vastPreRoll;
        }
        return videoSource;
    }

    preOrPostRoll(url) {
        return Promise.race([
            new Promise( (resolve, reject) => {
            fetch(url)
                .then(response => response.text())
                .then(str => parseVAST(str))
                .then(data => {
                    console.log(data);
                    //let mediaFile = data._adPod._ads._contents[0]._creatives._contents[0]._linear._mediaFiles[0]._uri;
                    let vast = data._adPod;
                    resolve(vast);
                })
                .catch( error => {
                    console.log(error);
                    reject(error);
                });
            })
            ,
            new Promise( (resolve, reject) => {
            this.delay(this.maxFetchTime).then( () => {
                reject("To slow request");
            })})
        ]);
    }

    playerEvent(event) {
        try {
            if (this.preRollError && this.videoType === "preRoll") return;
            if (this.postRollError && this.videoType === "postRoll") return;
            event.persist();
            event.target.volume = 0.0;
            let type = event.nativeEvent.type;
            if(type === "play") this.onPlay(event);
            else if(type === "ended") this.onEnded(event);
            else if(type === "pause") this.onPause(event);
        } catch (error) {
            this.adErrorEvent(event, error);
        }
    }
    
    onPlay(event) {
        if (this.getPlay()) {
            event.target.src = this.vastPreRoll;
            this.setPlay(false);
            this.setVideoType("preRoll");
            event.target.play("TESTSTRING");
        }
    }
    onEnded(event) {
        if (this.getVideoType() === "preRoll" && this.validURL(this.getContent()) ) {
            event.target.src = this.getContent();
            this.setVideoType("mainVideo");
            event.target.play();
        } else if (this.getVideoType() === "mainVideo"  && this.validURL(this.vastPostRoll)) {
            event.target.src = this.vastPostRoll;
            this.setVideoType("postRoll");
            event.target.play();
        }
    }
    onPause(event) {
        console.log("PAUSED");
    }

    onAdError(event, adErrorEvent) {
        event.target.src = this.content;
    }

    delay(time) {
        return new Promise(function (fulfill) {
          setTimeout(fulfill, time);
        });
      }

    validURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }

}
