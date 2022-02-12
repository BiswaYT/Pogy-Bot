
// Want to use or contribute to this? https://github.com/Glitchii/embedbuilder
// If you found an issue, please report it, make a P.R, or use the discussion page. Thanks

var activeFields, colNum = 1, num = 0;
window.onload = () => {
    document.querySelectorAll('img.clickable').forEach(e => e.addEventListener('click', el => window.open(el.target.src)));
    let editorHolder = document.querySelector('.editorHolder'),
        guiParent = document.querySelector('.top'),
        embedContent = document.querySelector('.messageContent'),
        embedCont = document.querySelector('.messageContent + .container'),
        gui = guiParent.querySelector('.gui:first-of-type'),
        toRGB = (hex, reversed, integer) => {
            if (reversed) return '#' + hex.match(/[\d]+/g).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
            if (integer) return parseInt(hex.match(/[\d]+/g).map(x => parseInt(x).toString(16).padStart(2, '0')).join(''), 16);
            if (hex.includes(',')) return hex.match(/[\d]+/g);
            hex = hex.replace('#', '').match(/.{1,2}/g)
            return [parseInt(hex[0], 16), parseInt(hex[1], 16), parseInt(hex[2], 16), 1];
        }, json = {
            content: "This is a Message Embed <:success:788438144818217000>\nEverything is _Customizable_ including **Emojis**\nYou can~~not~~ also do `this`.```py\nAnd ('this')```",
            embed: {
                title: "Hello! :wave:",
                description: "You can use [links](https://pogy.xyz) or emojis :smile: :eyes:\n```\nAnd also code blocks\n```",
                color: 4321431,
                timestamp: new Date().toISOString(),
                url: "https://pogy.xyz",
                author: {
                    name: "Author name",
                    url: "https://pogy.xyz",
                    icon_url: "https://i.imgur.com/sGUVicW.png"
                },
                thumbnail: {
                    url: "https://blog.logomyway.com/wp-content/uploads/2020/12/discord-mascot.png"
                },
                image: {
                    url: "https://1000logos.net/wp-content/uploads/2020/10/Discord-logo.png"
                },
                footer: {
                    text: "This is a footer text",
                    icon_url: "https://i.imgur.com/sGUVicW.png"
                },
                fields: [
                    {
                        name: "Field 1, ~~dolor~~",
                        value: "This is ***Pog***"
                    },
                    {
                        name: "Field 2",
                        value: "You can use custom emojis  <:poggers:790133942095183873>",
                        inline: false
                    },
                    {
                        name: "Inline field",
                        value: "Fields can be inline",
                        inline: true
                    },
                    {
                        name: "Inline field",
                        value: "*Inline*",
                        inline: true
                    },
                    {
                        name: "Inline field",
                        value: "value",
                        inline: true
                    },
                    {
                        name: "Another field",
                        value: "> Nope, didn't forget about code blocks",
                        inline: false
                    }
                ]
            }
        };
        
    window.editor = CodeMirror(elt => editorHolder.parentNode.replaceChild(elt, editorHolder), {
        value: JSON.stringify(json, null, 4),
        extraKeys: { Tab: cm => cm.replaceSelection("    ", "end") },
        gutters: ["CodeMirror-foldgutter", "CodeMirror-lint-markers"],
        scrollbarStyle: "overlay",
        mode: "application/json",
        theme: 'material-darker',
        matchBrackets: true,
        foldGutter: true,
        lint: true,
    });

    editor.focus();


    let notif = document.querySelector('.notification'),
        url = (url) => /^(https?:)?\/\//g.exec(url) ? url : '//' + url,
        makeShort = (txt, length, mediaWidth) => {
            if (mediaWidth && window.matchMedia(`(max-width:${mediaWidth}px)`).matches)
                return txt.length > (length - 3) ? txt.substring(0, length - 3) + '...' : txt;
            return txt;
        }, error = (msg, time) => {
            notif.innerHTML = msg, notif.style.display = 'block';
            time && setTimeout(() => notif.animate({ opacity: '0', bottom: '-50px', offset: 1 }, { easing: 'ease', duration: 500 })
                .onfinish = () => notif.style.removeProperty('display'), time);
            return false;
        }, allGood = e => {
            let re = /"((icon_)?url")(: *)("(?!https?:\/\/).+?")/g.exec(editor.getValue());
            if (re) return error(`URL should start with <code>https://</code> or <code>http://</code> on this line <span class="inline full">${makeShort(re[0], 30, 600)}</span>`);
            if (e.timestamp && new Date(e.timestamp).toString() === "Invalid Date") return error('Timestamp is invalid');
            return true;
        }, markup = (txt, opts) => {
            txt = txt
                .replace(/\&#60;:[^:]+:(\d+)\&#62;/g, '<img class="emoji" src="https://cdn.discordapp.com/emojis/$1.png"/>')
                .replace(/\&#60;a:[^:]+:(\d+)\&#62;/g, '<img class="emoji" src="https://cdn.discordapp.com/emojis/$1.gif"/>')
                .replace(/~~(.+?)~~/g, '<s>$1</s>')
                .replace(/\*\*\*(.+?)\*\*\*/g, '<em><strong>$1</strong></em>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/__(.+?)__/g, '<u>$1</u>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/_(.+?)_/g, '<em>$1</em>')
            if (opts.inlineBlock) txt = txt.replace(/\`([^\`]+?)\`|\`\`([^\`]+?)\`\`|\`\`\`((?:\n|.)+?)\`\`\`/g, (m, x, y, z) => x ? `<code class="inline">${x}</code>` : y ? `<code class="inline">${y}</code>` : z ? `<code class="inline">${z}</code>` : m);
            else txt = txt.replace(/\`\`\`(\w{1,15})?\n((?:\n|.)+?)\`\`\`|\`\`(.+?)\`\`(?!\`)|\`([^\`]+?)\`/g, (m, w, x, y, z) => w && x ? `<pre><code class="${w}">${x}</code></pre>` : x ? `<pre><code class="hljs nohighlight">${x}</code></pre>` : y || z ? `<code class="inline">${y || z}</code>` : m);
            if (opts.inEmbed) txt = txt.replace(/\[([^\[\]]+)\]\((.+?)\)/g, `<a title="$1" target="_blank" class="anchor" href="$2">$1</a>`);
            if (opts.replaceEmojis) txt = txt.replace(/(?<!code(?: \w+=".+")?>[^>]+)(?<!\/[^\s"]+?):((?!\/)\w+):/g, (match, x) => x && emojis[x] ? emojis[x] : match);
            txt = txt
                .replace(/(?<=\n|^)\s*&#62;\s+([^\n]+)/g, '<div class="blockquote"><div class="blockquoteDivider"></div><blockquote>$1</blockquote></div>')
                .replace(/\n/g, '<br>');
            return txt;
        },
        embed = document.querySelector('.embedGrid'),
        msgEmbed = document.querySelector('.msgEmbed'),
        embedTitle = document.querySelector('.embedTitle'),
        embedDescription = document.querySelector('.embedDescription'),
        embedAuthor = document.querySelector('.embedAuthor'),
        embedFooter = document.querySelector('.embedFooter'),
        embedImage = document.querySelector('.embedImage'),
        embedThumbnail = document.querySelector('.embedThumbnail'),
        embedFields = embed.querySelector('.embedFields'),
        encodeHTML = str => str.replace(/[\u00A0-\u9999<>\&]/g, i => '&#' + i.charCodeAt(0) + ';'),
        tstamp = stringISO => {
            let date = stringISO ? new Date(stringISO) : new Date(),
                dateArray = date.toLocaleString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' }),
                today = new Date(),
                yesterday = new Date(new Date().setDate(today.getDate() - 1));
            return today.toDateString() === date.toDateString() ? `Today at ${dateArray}` :
                yesterday.toDateString() === date.toDateString() ? `Yesterday at ${dateArray}` :
                    `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
        }, display = (el, data, displayType) => {
            if (data) el.innerHTML = data;
            el.style.display = displayType || "unset";
        }, hide = el => el.style.removeProperty('display'),
        imgSrc = (elm, src, remove) => remove ? elm.style.removeProperty('content') : elm.style.content = `url(${src})`,
        toObj = jsonString => JSON.parse(jsonString.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (x, y) => y ? "" : x));
    buildGui = (object, opts) => {
      
        gui.innerHTML = `
                <div class="item content"><p class="ttle">Message content</p></div>
                <div class="edit">
                    <textarea class="editContent" placeholder="Message content" autocomplete="off">${encodeHTML(object.content || '')}</textarea>
                </div>
                    <div class="item author rows2"><p class="ttle">Author</p></div>
                    <div class="edit">
                        <div class="linkName">
                            <div class="editIcon">
                                <span class="imgParent" ${object.embed?.author?.icon_url ? 'style="content: url(' + encodeHTML(object.embed.author.icon_url) + ')"' : ''}></span>
                                <input class="editAuthorLink" type="text" value="${encodeHTML(object.embed?.author?.icon_url || '')}" placeholder="Icon URL" autocomplete="off"/>
                            </div>
                            <div class="editName">
                                <input class="editAuthorName" type="text" value="${encodeHTML(object.embed?.author?.name || '')}" placeholder="Author name" autocomplete="off" />
                            </div>
                        </div>
                        <form method="post" enctype="multipart/form-data">
                            <input class="browserAuthorLink" type="file" name="file" id="file2" accept="image/png,image/gif,image/jpeg,image/webp" autocomplete="off" />
                            <button type="submit"></button>
                            <label for="file2">
                                <div class="browse">
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" xml:space="preserve">
                                        <g>
                                            <path xmlns="http://www.w3.org/2000/svg" d="m23.414 21.414 6.586-6.586v29.172c0 1.104.896 2 2 2s2-.896 2-2v-29.172l6.586 6.586c.39.391.902.586 1.414.586s1.024-.195 1.414-.586c.781-.781.781-2.047 0-2.828l-10-10c-.78-.781-2.048-.781-2.828 0l-10 10c-.781.781-.781 2.047 0 2.828.78.781 2.048.781 2.828 0z" fill="#ffffff" data-original="#000000"></path>
                                            <path xmlns="http://www.w3.org/2000/svg" d="m50 40c-1.104 0-2 .896-2 2v8c0 1.103-.897 2-2 2h-28c-1.103 0-2-.897-2-2v-8c0-1.104-.896-2-2-2s-2 .896-2 2v8c0 3.309 2.691 6 6 6h28c3.309 0 6-2.691 6-6v-8c0-1.104-.896-2-2-2z" fill="#ffffff" data-original="#000000"></path>
                                        </g>
                                    </svg>
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
                                        <circle fill="#fff" stroke="none" cx="6" cy="50" r="6">
                                            <animateTransform attributeName="transform" dur="1s" type="translate" values="0 15 ; 0 -15; 0 15" repeatCount="indefinite" begin="0.1"></animateTransform>
                                        </circle>
                                        <circle fill="#fff" stroke="none" cx="30" cy="50" r="6">
                                            <animateTransform attributeName="transform" dur="1s" type="translate" values="0 10 ; 0 -10; 0 10" repeatCount="indefinite" begin="0.2"></animateTransform>
                                        </circle>
                                        <circle fill="#fff" stroke="none" cx="54" cy="50" r="6">
                                            <animateTransform attributeName="transform" dur="1s" type="translate" values="0 5 ; 0 -5; 0 5" repeatCount="indefinite" begin="0.3"></animateTransform>
                                        </circle>
                                    </svg>                                    
                                    <p></p>
                                </div>
                            </label>
                        </form>
                    </div>                        
                    <div class="item title inlineField">
                        <p class="ttle">Title</p>
                        <input class="editTitle" type="text" placeholder="Title" autocomplete="off" value="${encodeHTML(object.embed?.title || '')}">
                    </div>
                    <div class="item description"><p class="ttle">Description</p></div>
                    <div class="edit">
                        <textarea class="editDescription" placeholder="Embed description" autocomplete="off">${encodeHTML(object.embed?.description || '')}</textarea>
                    </div>
                    <div class="item fields"><p class="ttle">Fields</p></div>
                    <div class="edit"></div>
                    <div class="item thumbnail largeImg"><p class="ttle">Thumbnail</p></div>
                    <div class="edit">
                        <div class="linkName">
                            <div class="editIcon">
                                <span class="imgParent" ${object.embed?.thumbnail?.url ? 'style="content: url(' + encodeHTML(object.embed.thumbnail.url) + ')"' : ''}></span>
                                <div class="txtCol">
                                    <input class="editThumbnailLink" type="text" value="${encodeHTML(object.embed?.thumbnail?.url || '')}" placeholder="Thumbnail URL" autocomplete="off" />
                                    <form method="post" enctype="multipart/form-data">
                                        <input class="browseThumbLink" type="file" name="file" id="file3" accept="image/png,image/gif,image/jpeg,image/webp" autocomplete="off" />
                                        <button type="submit"></button>
                                        <label for="file3">
                                            <div class="browse">
                                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" xml:space="preserve">
                                                    <g>
                                                        <path xmlns="http://www.w3.org/2000/svg" d="m23.414 21.414 6.586-6.586v29.172c0 1.104.896 2 2 2s2-.896 2-2v-29.172l6.586 6.586c.39.391.902.586 1.414.586s1.024-.195 1.414-.586c.781-.781.781-2.047 0-2.828l-10-10c-.78-.781-2.048-.781-2.828 0l-10 10c-.781.781-.781 2.047 0 2.828.78.781 2.048.781 2.828 0z" fill="#ffffff" data-original="#000000"></path>
                                                        <path xmlns="http://www.w3.org/2000/svg" d="m50 40c-1.104 0-2 .896-2 2v8c0 1.103-.897 2-2 2h-28c-1.103 0-2-.897-2-2v-8c0-1.104-.896-2-2-2s-2 .896-2 2v8c0 3.309 2.691 6 6 6h28c3.309 0 6-2.691 6-6v-8c0-1.104-.896-2-2-2z" fill="#ffffff" data-original="#000000"></path>
                                                    </g>
                                                </svg>
                                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
                                                    <circle fill="#fff" stroke="none" cx="6" cy="50" r="6">
                                                        <animateTransform attributeName="transform" dur="1s" type="translate" values="0 15 ; 0 -15; 0 15" repeatCount="indefinite" begin="0.1"></animateTransform>
                                                    </circle>
                                                    <circle fill="#fff" stroke="none" cx="30" cy="50" r="6">
                                                        <animateTransform attributeName="transform" dur="1s" type="translate" values="0 10 ; 0 -10; 0 10" repeatCount="indefinite" begin="0.2"></animateTransform>
                                                    </circle>
                                                    <circle fill="#fff" stroke="none" cx="54" cy="50" r="6">
                                                        <animateTransform attributeName="transform" dur="1s" type="translate" values="0 5 ; 0 -5; 0 5" repeatCount="indefinite" begin="0.3"></animateTransform>
                                                    </circle>
                                                </svg>
                                                <p></p>
                                            </div>
                                        </label>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="item image largeImg"><p class="ttle">Image</p></div>
                    <div class="edit">
                        <div class="linkName">
                            <div class="editIcon">
                                <span class="imgParent" ${object.embed?.image?.url ? 'style="content: url(' + encodeHTML(object.embed.image.url) + ')"' : ''}></span>
                                <div class="txtCol">
                                    <input class="editImageLink" type="text" value="${encodeHTML(object.embed?.image?.url || '')}" placeholder="Image URL" autocomplete="off" />
                                    <form method="post" enctype="multipart/form-data">
                                        <input class="browseImageLink" type="file" name="file" id="file4" accept="image/png,image/gif,image/jpeg,image/webp" autocomplete="off" />
                                        <button type="submit"></button>
                                        <label for="file4">
                                            <div class="browse">
                                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" xml:space="preserve">
                                                    <g>
                                                        <path xmlns="http://www.w3.org/2000/svg" d="m23.414 21.414 6.586-6.586v29.172c0 1.104.896 2 2 2s2-.896 2-2v-29.172l6.586 6.586c.39.391.902.586 1.414.586s1.024-.195 1.414-.586c.781-.781.781-2.047 0-2.828l-10-10c-.78-.781-2.048-.781-2.828 0l-10 10c-.781.781-.781 2.047 0 2.828.78.781 2.048.781 2.828 0z" fill="#ffffff" data-original="#000000"></path>
                                                        <path xmlns="http://www.w3.org/2000/svg" d="m50 40c-1.104 0-2 .896-2 2v8c0 1.103-.897 2-2 2h-28c-1.103 0-2-.897-2-2v-8c0-1.104-.896-2-2-2s-2 .896-2 2v8c0 3.309 2.691 6 6 6h28c3.309 0 6-2.691 6-6v-8c0-1.104-.896-2-2-2z" fill="#ffffff" data-original="#000000"></path>
                                                    </g>
                                                </svg>
                                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
                                                    <circle fill="#fff" stroke="none" cx="6" cy="50" r="6">
                                                        <animateTransform attributeName="transform" dur="1s" type="translate" values="0 15 ; 0 -15; 0 15" repeatCount="indefinite" begin="0.1"></animateTransform>
                                                    </circle>
                                                    <circle fill="#fff" stroke="none" cx="30" cy="50" r="6">
                                                        <animateTransform attributeName="transform" dur="1s" type="translate" values="0 10 ; 0 -10; 0 10" repeatCount="indefinite" begin="0.2"></animateTransform>
                                                    </circle>
                                                    <circle fill="#fff" stroke="none" cx="54" cy="50" r="6">
                                                        <animateTransform attributeName="transform" dur="1s" type="translate" values="0 5 ; 0 -5; 0 5" repeatCount="indefinite" begin="0.3"></animateTransform>
                                                    </circle>
                                                </svg>
                                                <p></p>
                                            </div>
                                        </label>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="item footer rows2"><p class="ttle">Footer</p></div>
                    <div class="edit">
                        <div class="linkName">
                            <div class="editIcon">
                                <span class="imgParent" ${object.embed?.footer?.icon_url ? 'style="content: url(' + encodeHTML(object.embed.footer.icon_url) + ')"' : ''}></span>
                                <input class="editFooterLink" type="text" value="${encodeHTML(object.embed?.footer?.icon_url || '')}" placeholder="Icon URL" autocomplete="off"/>
                            </div>
                            <div class="editName">
                                <input class="editFooterText" type="text" value="${encodeHTML(object.embed?.footer?.text || '')}" placeholder="Footer text" autocomplete="off" />
                            </div>
                        </div>
                        <form method="post" enctype="multipart/form-data">
                            <input class="browserFooterLink" type="file" name="file" id="file" accept="image/png,image/gif,image/jpeg,image/webp" autocomplete="off" />
                            <button type="submit"></button>
                            <label for="file">
                                <div class="browse">
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" xml:space="preserve">
                                        <g>
                                            <path xmlns="http://www.w3.org/2000/svg" d="m23.414 21.414 6.586-6.586v29.172c0 1.104.896 2 2 2s2-.896 2-2v-29.172l6.586 6.586c.39.391.902.586 1.414.586s1.024-.195 1.414-.586c.781-.781.781-2.047 0-2.828l-10-10c-.78-.781-2.048-.781-2.828 0l-10 10c-.781.781-.781 2.047 0 2.828.78.781 2.048.781 2.828 0z" fill="#ffffff" data-original="#000000"></path>
                                            <path xmlns="http://www.w3.org/2000/svg" d="m50 40c-1.104 0-2 .896-2 2v8c0 1.103-.897 2-2 2h-28c-1.103 0-2-.897-2-2v-8c0-1.104-.896-2-2-2s-2 .896-2 2v8c0 3.309 2.691 6 6 6h28c3.309 0 6-2.691 6-6v-8c0-1.104-.896-2-2-2z" fill="#ffffff" data-original="#000000"></path>
                                        </g>
                                    </svg>
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
                                        <circle fill="#fff" stroke="none" cx="6" cy="50" r="6">
                                            <animateTransform attributeName="transform" dur="1s" type="translate" values="0 15 ; 0 -15; 0 15" repeatCount="indefinite" begin="0.1"></animateTransform>
                                        </circle>
                                        <circle fill="#fff" stroke="none" cx="30" cy="50" r="6">
                                            <animateTransform attributeName="transform" dur="1s" type="translate" values="0 10 ; 0 -10; 0 10" repeatCount="indefinite" begin="0.2"></animateTransform>
                                        </circle>
                                        <circle fill="#fff" stroke="none" cx="54" cy="50" r="6">
                                            <animateTransform attributeName="transform" dur="1s" type="translate" values="0 5 ; 0 -5; 0 5" repeatCount="indefinite" begin="0.3"></animateTransform>
                                        </circle>
                                    </svg>                                    
                                    <p></p>
                                </div>
                            </label>
                        </form>
                    </div>`;

        let fieldsEditor = gui.querySelector('.fields ~ .edit'), addField = `
                    <div class="addField">
                        <p>New Field</p>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" x="0" y="0" viewBox="0 0 477.867 477.867" xml:space="preserve">
                            <g>
                                <g xmlns="http://www.w3.org/2000/svg">
                                    <g>
                                        <path d="M392.533,0h-307.2C38.228,0.056,0.056,38.228,0,85.333v307.2c0.056,47.105,38.228,85.277,85.333,85.333h307.2    c47.105-0.056,85.277-38.228,85.333-85.333v-307.2C477.81,38.228,439.638,0.056,392.533,0z M443.733,392.533    c0,28.277-22.923,51.2-51.2,51.2h-307.2c-28.277,0-51.2-22.923-51.2-51.2v-307.2c0-28.277,22.923-51.2,51.2-51.2h307.2    c28.277,0,51.2,22.923,51.2,51.2V392.533z" fill="#ffffff" data-original="#000000"
                                        ></path>
                                    </g>
                                </g>
                                <g xmlns="http://www.w3.org/2000/svg">
                                    <g>
                                        <path d="M324.267,221.867H256V153.6c0-9.426-7.641-17.067-17.067-17.067s-17.067,7.641-17.067,17.067v68.267H153.6    c-9.426,0-17.067,7.641-17.067,17.067S144.174,256,153.6,256h68.267v68.267c0,9.426,7.641,17.067,17.067,17.067    S256,333.692,256,324.267V256h68.267c9.426,0,17.067-7.641,17.067-17.067S333.692,221.867,324.267,221.867z" fill="#ffffff" data-original="#000000"></path>
                                    </g>
                                </g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                                <g xmlns="http://www.w3.org/2000/svg"></g>
                            </g>
                        </svg>
                    </div>`;
        if (object.embed?.fields) fieldsEditor.innerHTML = object.embed.fields.filter(f => f && typeof f === 'object').map(f => `
                    <div class="field">
                        <div class="fieldNumber"></div>
                        <div class="fieldInner">
                            <div class="designerFieldName">
                                <input type="text" placeholder="Field name" autocomplete="off" value="${encodeHTML(f.name)}">
                            </div>
                            <div class="designerFieldValue">
                                <textarea placeholder="Field value" autocomplete="off">${encodeHTML(f.value)}</textarea>
                            </div>
                        </div>
                        <div class="inlineCheck">
                            <label>
                                <input type="checkbox" autocomplete="off" ${f.inline ? 'checked' : ''}>
                                <span>Inline</span>
                            </label>
                        </div>
                        <div class="removeBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 329.26933 329" xml:space="preserve">
                                <g>
                                    <path xmlns="http://www.w3.org/2000/svg" d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0" fill="#ffffff" data-original="#000000"/>
                                </g>
                            </svg>
                            <span>Remove</span>
                        </div>
                    </div>`).join('\n') + addField;
        else fieldsEditor.innerHTML = addField;

        gui.querySelectorAll('.removeBtn').forEach(e => {
            e.addEventListener('click', el => {
                fields = gui.querySelector('.fields ~ .edit');
                let field = el.target.closest('.field');
                if (field) {
                    let i = Array.from(fields.children).indexOf(field), jsonField = object.embed.fields[i];
                    if (jsonField) {
                        object.embed.fields.splice(i, 1);
                        field.remove();
                        update(object);
                    }
                }
            })
        })

        document.querySelectorAll('.gui > .item').forEach(e => {
            e.addEventListener('click', el => {
                let elm = (el.target.closest('.top>.gui>.item') || el.target);
                if (elm.classList.contains('active')) window.getSelection().anchorNode !== elm && elm.classList.remove('active');
                else {
                    let inlineField = elm.closest('.inlineField'),
                        input = elm.nextElementSibling.querySelector('input[type="text"]'),
                        txt = elm.nextElementSibling.querySelector('textarea');
                    elm.classList.add('active');
                    if (inlineField) inlineField.querySelector('.ttle~input').focus();
                    else if (input) {
                        input.focus();
                        input.selectionStart = input.selectionEnd = input.value.length;
                    } else if (txt) txt.focus();
                    elm.classList.contains('fields') && elm.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            })
        })

        content = gui.querySelector('.editContent');
        title = gui.querySelector('.editTitle');
        authorName = gui.querySelector('.editAuthorName');
        authorLink = gui.querySelector('.editAuthorLink');
        desc = gui.querySelector('.editDescription');
        thumbLink = gui.querySelector('.editThumbnailLink');
        imgLink = gui.querySelector('.editImageLink');
        footerText = gui.querySelector('.editFooterText');
        footerLink = gui.querySelector('.editFooterLink');
        fields = gui.querySelector('.fields ~ .edit');

        document.querySelector('.addField').addEventListener('click', () => {
            !json.embed && (json.embed = {});
            let arr = json.embed.fields || [];
            if (arr.length >= 25) return error(`You can't have over 25 embed fields.`, 5000);
            arr.push({ name: "Field name", value: "Field value", inline: false });
            json.embed.fields = arr;
            update(json);
            buildGui(json, { newField: true, activate: document.querySelectorAll('.gui > .item.active') });
        })

        gui.querySelectorAll('textarea, input').forEach(e => e.addEventListener('input', el => {
            let v = el.target.value, field = el.target.closest('.field');
            if (field) {
                let jsonField = json.embed.fields[Array.from(fields.children).indexOf(field)];
                if (jsonField) {
                    if (el.target.type === 'text') jsonField.name = v;
                    else if (el.target.type === 'textarea') jsonField.value = v;
                    else jsonField.inline = el.target.checked;
                } else {
                    let obj = {}
                    if (el.target.type === 'text') obj.name = v;
                    else if (el.target.type === 'textarea') obj.value = v;
                    else obj.inline = el.target.checked;
                    json.embed.fields.push(obj);
                }
            } else {
                json.embed ??= {};
                switch (el.target) {
                    case content: json.content = v; break;
                    
                    case title: json.embed.title = v; break;
                    case authorName: json.embed.author ??= {}, json.embed.author.name = v; break;
                    case authorLink: json.embed.author ??= {}, json.embed.author.icon_url = v, imgSrc(el.target.previousElementSibling, v); break;
                    case desc: json.embed.description = v; break;
                    case thumbLink: json.embed.thumbnail ??= {}, json.embed.thumbnail.url = v, imgSrc(el.target.closest('.editIcon').querySelector('.imgParent'), v); break;
                    case imgLink: json.embed.image ??= {}, json.embed.image.url = v, imgSrc(el.target.closest('.editIcon').querySelector('.imgParent'), v); break;
                    case footerText: json.embed.footer ??= {}, json.embed.footer.text = v; break;
                    case footerLink: json.embed.footer ??= {}, json.embed.footer.icon_url = v, imgSrc(el.target.previousElementSibling, v); break;
                }
            }
            if(json.content){
            if(json.content.length > 2000) {
             json.content = json.content.substring(0, 2000);
             return error(`Content reached 2000 characters`, 4000)
            }
            }

            if(json.embed.title){
            if(json.embed.title.length > 256) {
            json.embed.title = json.embed.title.substring(0, 256);
            return error(`Title reached 256 characters`, 4000)
            }
            }



            if(json.embed.description){
            if(json.embed.description.length > 2048 ) {
            json.embed.description = json.embed.description.substring(0, 2048); 
            return error(`Description reached 2048 characters`, 4000)
            }
            }

    

            update(json);
        }))

        if (opts?.activate) {
            let elements = opts.activate;
            Array.from(elements).map(el => el.className).map(clss => '.' + clss.split(' ').slice(0, 2).join('.'))
                .forEach(clss => document.querySelectorAll(clss)
                    .forEach(e => e.classList.add('active')))
        } else['.item.author', '.item.description'].forEach(clss => document.querySelector(clss).classList.add('active'));

        if (opts?.newField) {
            let last = fields.children[fields.childElementCount - 2], el = last.querySelector('.designerFieldName > input');
            el.setSelectionRange(el.value.length, el.value.length); el.focus();
            last.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        let files = document.querySelectorAll('input[type="file"]');
        files.forEach(f => f.addEventListener('change', e => {
            if (f.files) {
                e.target.nextElementSibling.click();
                e.target.closest('.edit').querySelector('.browse').classList.add('loading');
            }
        }))

        document.querySelectorAll('form').forEach(form => form.addEventListener('submit', e => {
            e.preventDefault();
            let formData = new FormData(e.target);
            formData.append('file', files.files);
            formData.append('datetime', '5m');
            fetch('https://tempfile.site/api/files', {
                method: 'POST',
                body: formData,
            })
                .then(res => res.json())
                .then(res => {
                    let browse = e.target.closest('.edit').querySelector('.browse');
                    browse.classList.remove('loading');
                    if (!res.ok) {
                        console.log(res.error);
                        browse.classList.add('error');
                        return setTimeout(() => browse.classList.remove('error'), 5000)
                    }
                    imgSrc(e.target.previousElementSibling.querySelector('.editIcon > .imgParent') || e.target.closest('.editIcon').querySelector('.imgParent'), res.link);
                    let input = e.target.previousElementSibling.querySelector('.editIcon > input') || e.target.previousElementSibling;
                    input.value = res.link;
                    if (input === authorLink) json.embed.author.icon_url = res.link;
                    else if (input === thumbLink) json.embed.thumbnail.url = res.link;
                    else if (input === imgLink) json.embed.image.url = res.link;
                    else json.embed.footer.icon_url = res.link;
                    update(json);
                    console.info(`Image (${res.link}) will be deleted in 5 minutes. To delete it now got to ${res.link.replace('/files', '/del')} and enter this code: ${res.authkey}`);
                }).catch(err => `Request to tempfile.site failed with error: ${err}`)
        }))
    }

    buildGui(json);
    fields = gui.querySelector('.fields ~ .edit');
    update = data => {
        try {
            if (!data.content) embedContent.classList.add('empty');
            else {
                embedContent.innerHTML = markup(encodeHTML(data.content), { replaceEmojis: true });
                embedContent.classList.remove('empty');
            }
            if (data.embed && Object.keys(data.embed).length) {
                let e = data.embed;
                if (!allGood(e)) return;
                if (e.title) display(embedTitle, markup(`${e.url ? '<a class="anchor" target="_blank" href="' + encodeHTML(url(e.url)) + '">' + encodeHTML(e.title) + '</a>' : encodeHTML(e.title)}`, { replaceEmojis: true, inlineBlock: true }));
                else hide(embedTitle);
                if (e.description) display(embedDescription, markup(encodeHTML(e.description), { inEmbed: true, replaceEmojis: true }));
                else hide(embedDescription);
                if (e.color) embed.closest('.embed').style.borderColor = encodeHTML(typeof e.color === 'number' ? '#' + e.color.toString(16).padStart(6, "0") : e.color);
                else embed.closest('.embed').style.removeProperty('border-color');
                if (e.author && e.author.name) display(embedAuthor, `
                    ${e.author.icon_url ? '<img class="embedAuthorIcon" src="' + encodeHTML(url(e.author.icon_url)) + '">' : ''}
                    ${e.author.url ? '<a class="embedAuthorNameLink embedLink embedAuthorName" href="' + encodeHTML(url(e.author.url)) + '" target="_blank">' + encodeHTML(e.author.name) + '</a>' : '<span class="embedAuthorName">' + encodeHTML(e.author.name) + '</span>'}`, 'flex');
                else hide(embedAuthor);
                if (e.thumbnail && e.thumbnail.url) embedThumbnail.src = encodeHTML(e.thumbnail.url), embedThumbnail.style.display = 'block';
                else hide(embedThumbnail);
                if (e.image && e.image.url) embedImage.src = encodeHTML(e.image.url), embedImage.style.display = 'block';
                else hide(embedImage);
                if (e.footer && e.footer.text) display(embedFooter, `
                    ${e.footer.icon_url ? '<img class="embedFooterIcon" src="' + encodeHTML(url(e.footer.icon_url)) + '">' : ''}<span class="embedFooterText">
                        ${encodeHTML(e.footer.text)}
                    ${e.timestamp ? '<span class="embedFooterSeparator">•</span>' + encodeHTML(tstamp(e.timestamp)) : ''}</span></div>`, 'flex');
                else if (e.timestamp) display(embedFooter, `<span class="embedFooterText">${encodeHTML(tstamp(e.timestamp))}</span></div>`, 'flex');
                else hide(embedFooter);
                if (e.fields) {
                    embedFields.innerHTML = '';
                    e.fields.forEach(f => {
                        if (f.name && f.value) {
                            if (!f.inline) {
                                let el = embedFields.insertBefore(document.createElement('div'), null);
                                el.outerHTML = `
                            <div class="embedField" style="grid-column: 1 / 13;">
                                <div class="embedFieldName">${markup(encodeHTML(f.name), { inEmbed: true, replaceEmojis: true, inlineBlock: true })}</div>
                                <div class="embedFieldValue">${markup(encodeHTML(f.value), { inEmbed: true, replaceEmojis: true })}</div>
                            </div>`;
                            } else {
                                el = embedFields.insertBefore(document.createElement('div'), null);
                                el.outerHTML = `
                            <div class="embedField ${num}" style="grid-column: ${colNum} / ${colNum + 4};">
                                <div class="embedFieldName">${markup(encodeHTML(f.name), { inEmbed: true, replaceEmojis: true, inlineBlock: true })}</div>
                                <div class="embedFieldValue">${markup(encodeHTML(f.value), { inEmbed: true, replaceEmojis: true })}</div>
                            </div>`;
                                colNum = (colNum === 9 ? 1 : colNum + 4);
                                num++;
                            }
                        }
                    });
                    colNum = 1;
                    let len = e.fields.filter(f => f.inline).length;
                    if (len === 2 || (len > 3 && len % 2 !== 0)) {
                        let children = Array.from(embedFields.children), arr = children.filter(x => x === children[len] || x === children[len - 1]);
                        arr[0] && (arr[0].style.gridColumn = '1 / 7');
                        arr[1] && (arr[1].style.gridColumn = '7 / 13');
                    }
                    display(embedFields, undefined, 'grid');
                } else hide(embedFields);
                embedCont.classList.remove('empty');
                document.querySelectorAll('.markup pre > code').forEach((block) => hljs.highlightBlock(block));
                notif.animate({ opacity: '0', bottom: '-50px', offset: 1 }, { easing: 'ease', duration: 500 }).onfinish = () => notif.style.removeProperty('display');
                twemoji.parse(msgEmbed);
            } else embedCont.classList.add('empty');
        } catch (e) {
            error(e);
        }
    }

    editor.on('change', editor => {
        try { update(toObj(editor.getValue())); }
        catch (e) {
            if (editor.getValue()) return;
            embedCont.classList.add('empty');
            embedContent.innerHTML = '';
        }
    });

    let picker = new CP(document.querySelector('.picker'), state = { parent: document.querySelector('.cTop') });
    picker.fire('change', toRGB('#41f097'));

    let colRight = document.querySelector('.colRight'), removePicker = () => colRight.classList.remove('picking');
    document.querySelector('.colBack').addEventListener('click', e => {
        picker.self.remove(); removePicker();
    })
    picker.on('enter', () => colRight.classList.add('picking'))
    picker.on('exit', removePicker);

    document.querySelectorAll('.colr').forEach(e => e.addEventListener('click', el => {
        el = el.target.closest('.colr') || el.target;
        embed.closest('.embed').style.borderColor = el.style.backgroundColor;
        json.embed && (json.embed.color = toRGB(el.style.backgroundColor, false, true));
        picker.source.style.removeProperty('background');
    }))

    setTimeout(() => {
        picker.on('change', function (r, g, b, a) {
            embed.closest('.embed').style.borderColor = this.color(r, g, b);
            json.embed && (json.embed.color = parseInt(this.color(r, g, b).slice(1), 16));
            picker.source.style.background = this.color(r, g, b);
        })
    }, 1000)

    document.querySelector('.timeText').innerText = tstamp();
    document.querySelectorAll('.markup pre > code').forEach(block => hljs.highlightBlock(block));
    document.querySelectorAll('.done .selectOptions .channel').forEach(e => e.addEventListener('click', el => {
        if (document.querySelector('.messageContent.empty+.container.empty')) return error(`There's nothing to send.`, 2500);
       el.target.closest('.done').classList.add('sent');
                setTimeout(() => el.target.closest('.done').classList.remove('sent'), 3000);
        fetch(`/dashboard/${guildID}/embeds`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'embed', guild: guildID, json, to: el.target.querySelector('span').getAttribute('data-data') })
        })
            .then(res => res.text())
            .then(res => {
                if (res) return error(res, 5000);
                el.target.closest('.done').classList.add('sent');
                setTimeout(() => el.target.closest('.done').classList.remove('sent'), 3000);
              
            }).catch(err => error(err, 5000));
    }));

    !window.navigator.userAgent.match(/Firefox\/[\d\.]+$/g) && // Firefox pushes the text up a little
        document.querySelector('.botText').style.removeProperty('top');

    document.querySelector('.opt.gui').addEventListener('click', () => {
        json = toObj(editor.getValue() || '{}');
        buildGui(json, { activate: activeFields });
        document.body.classList.add('gui');
        activeFields = null;
    })

    document.querySelector('.opt.json').addEventListener('click', () => {
        editor.setValue(JSON.stringify(json, null, 4));
        editor.refresh();
        document.body.classList.remove('gui');
        editor.focus();
        activeFields = document.querySelectorAll('.gui > .item.active');
    })

    document.querySelector('.clear').addEventListener('click', () => {
        json = { };
        embed.style.removeProperty('border-color');
        picker.source.style.removeProperty('background');
        update(json); buildGui(json); editor.setValue(JSON.stringify(json, null, 4));
        document.querySelectorAll('.gui>.item').forEach(e => e.classList.add('active'));
        content.focus();
    })

    let colrs = document.querySelector('.colrs');
    document.querySelector('.pickerToggle').addEventListener('click', () => colrs.classList.toggle('display'));
    update(json);

$(document).on('click', '#save-custom',  function(e){
var command = document.getElementById("custom-command").value;
if(!command) return error("provide a custom command!", 4000)
if(command.length > 30) return error("Command length exceeds 30 characters.", 4000);

  error('Successfully saved command, if not saved, <a href="https://pogy.xyz/embeds">read here</a>', 10000)
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: `/dashboard/${guildID}/embeds`,
            data: JSON.stringify({ type: 'customcommand', guild: guildID, json, command:command}),
            contentType: 'application/json'
        }).done(function(response) {
            

        }).fail(function(xhr, status, message) {
   error(`${message}`, 4000)         
        });
   
});


function Clipboard_CopyTo(value) {
  var tempInput = document.createElement("input");
  tempInput.value = value;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}

$(document).ready(function(){
$(document).on('click', '#copy', function(){
var toCopy = JSON.stringify(json) 
Clipboard_CopyTo(toCopy);
error("Copied Json!", 4000)
});




$(document).on('click', '#sendWebhook', function(e){
var webhook = document.getElementById("webhook").value;
if(!webhook) return error('Provide a valid Webhook', 4000)
 if (document.querySelector('.messageContent.empty+.container.empty')) return error(`There's nothing to send.`, 2500);

var params = {
  "content": json.content,
  "embeds": [json.embed]
}

        e.preventDefault();
        $.ajax({
            type: "POST",
            url:  webhook,
            data: JSON.stringify(params),
            contentType: 'application/json'
        }).done(function(response) {
            
error('Successfully sent webhook', 4000)

        }).fail(function(xhr, status, message) {
  error("403 - There was an error sending your embed.", 6000)         

        });
});

});


};



