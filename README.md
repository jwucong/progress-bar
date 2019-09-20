# JwcProgress

[**Live Demo**](https://jwucong.github.io/)  

```javascript
// Live Demo Code
var progress = new JwcProgress({
  onEnd: function () {
    this.fadeOut(this.destroy);
  }
});
progress.start();
window.onload = function () {
  progress.end();
}
```

### 0. Development Env
- node: v10.16.13
- npm: v6.9.0

### 1. Build
> output: ./dist
   
```bash
npm install
npm run build
```

### 2. ES5 mode

```html
<html>
<head>
  <script src="./dist/jwcProgress.js"></script>
  <script>
    var jwcProgress = new JwcProgress()
    jwcProgress.start().end();
  </script>
</head>
</html>

```

### 3. ES6 mode

```javascript
import JwcProgress from './dist/jwcProgress.js';
const jwcProgress = new JwcProgress()
jwcProgress.start().end();
```

### 4. Instantiation
```javascript
const jwcProgress = new JwcProgress(options)
```
**options**\<Object\>

| key   | type  | default | remarks |
| :--- | :--- | :---  | :---   |
| template | String,HTMLElement | "" | Custom loading html |
| container | String,HTMLElement | body | loading container |
| containerStyle | Object | null | container style |
| customClass | String | "" | custom classname for loading |
| classPrefix | String | jwc | classname prefix |
| inlineStyle | Boolean | true | use inline style |
| duration | Number | 1500 | minimum duration for loading (ms) |
| timeout | Number | 0 | loading timeout (ms), 0 means no timeout is set |
| slowRange | String | "85-96" | within this range, progress is extremely slow |
| stopAt | Number | 99 | the progress stops here before call end() |
| onInited | Function | null | triggered after initialization |
| onStart | Function | null | triggered after the start |
| onProgress | Function | null | triggered when progress changes, callback function receive a parameter to indicate the current progress |
| onEnd | Function | null | triggered after the end |
| onTimeout | Function | null | triggered after timeout |  


### 5. Methods
> All methods are defined on the JwcProgress.prototype                          

- **init**  
grammar: init()  
Initialization progress bar

- **start**  
grammar: start([duration])  

    1. **duration\<Number>**: cover options.duration  
    
    Starting progress 


- **end**  
grammar: end()  
End and stop progress  


- **show**  
grammar: show()  
Display progress bar  

- **hide**  
grammar: hide()  
Hidden progress bar 

- **fadeIn**  
grammar: fadeIn(duration[, callback])  

    1. **duration\<Number>**: fade in duration, default 750  
    2. **callback\<Function>**: after fade in callback  
    
    Progress bar fade in  

- **fadeOut**  
grammar: fadeOut(duration[, callback])  

    1. **duration\<Number>**: fade out duration, default 750  
    2. **callback\<Function>**: after fade out callback  
    
    Progress bar fade out 

- **destroy**  
grammar: destroy()  
destroy progress bar  
