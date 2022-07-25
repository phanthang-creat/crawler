const puppeteer = require('puppeteer');
const fs = require('fs');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down');

// var URL = "https://www.youtube.com/watch?v=Z8nbb0ELUl0";
// const URL = "https://youtube.com/watch?v=6qQWZmk5_WY"
// const URL = "https://www.youtube.com/watch?v=K9_VFxzCuQ0"
const URL = "https://www.youtube.com/watch?v=DcCISK3sCYg"

//var URL = "https://www.youtube.com/watch?v=kxcQ7MUeLeI";

function run(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                //dumpio: true,
                args: ['--window-size=1024,1024'],
                ignoreDefaultArgs: ['--mute-audio'],
            }
            );

            const page = await browser.newPage();
            await page.goto(URL);

            //await page.waitForTimeout(3000);

            const scrollStep = 250 // default
            const scrollDelay = 100 // default

            console.log('start crawling');

            let isLoadingAvailable = true // Your condition-to-stop
            var limitcnt = 0;

            while (isLoadingAvailable) {
                let currentPosition = await scrollPageToBottom(page, scrollStep, scrollDelay);
                await page.waitForResponse(
                    response => {
                        console.log(response.status());
                        // TODO: 크롤링 종료를 위한 graceful 처리.
                        if (response.status() === 200 || response.status() === 204) {

                        }
                        else {
                            // isLoadingAvailable = false;
                        }
                        
                        limitcnt++;
                        
                        if (limitcnt > 10)
                            isLoadingAvailable = false;

                        return true;
                    }
                )
            }


            page.on('console', msg => {
                for (let i = 0; i < msg.args().length; ++i)
                    console.log(`${i}: ${msg.args()[i]}`);
                    // printLogAt_67(msg.args())
            });

            // await page.waitForTimeout(3000);

            // const winner = await Promise.race([
            //     page.waitForSelector('#more-replies'),
            // ])

            // await page.click(winner._remoteObject.description);

            //await page.qu.querySelectorAll('#more-replies').click();  

            await page.waitForTimeout(3000);

            
            let loadComments = await page.evaluate(async() => {
                // let scroller = scrollPageToBottom
                const wait = (ms) => new Promise(res => setTimeout(res, ms)); //delay function()
                // document.querySelector('#more-replies').forEach((item) => {item.click()}) //click #more-replies
                console.log("loading comments")
                let scrollHeight = 0;
                let flag = true;

                setTimeout(() => {
                    flag = false;
                }, 300000);

                while (flag) {
                    console.log("loading reply of comment...")
                    let moreReplies = document.querySelectorAll('#more-replies');
                    moreReplies.forEach(async (item) => {
                        // item.scrollIntoView({
                        //     behavior: "smooth", block: 'end', inline: 'end'
                        // })
                        item.click()
                        // await wait(400);
                    })

                    await wait(500);

                    
                    let commentsNode = document.querySelectorAll('ytd-comment-thread-renderer')

                    commentsNode[commentsNode.length - 18].scrollIntoView({
                        behavior: "smooth", block: 'end', inline: 'end'
                    })

                    await wait(1000);

                    commentsNode[commentsNode.length - 12].scrollIntoView({
                        behavior: "smooth", block: 'end', inline: 'end'
                    })
                    await wait(1000);

                    commentsNode[commentsNode.length - 6].scrollIntoView({
                        behavior: "smooth", block: 'end', inline: 'end'
                    })
                    await wait(1000);

                    commentsNode[commentsNode.length - 1].scrollIntoView({
                        behavior: "smooth", block: 'end', inline: 'end'
                    })
                    window.scrollTo(0, document.scrollingElement.scrollHeight); //scroll to load more comments
                    await wait(1000) // wait 400ms
                    if (document.scrollingElement.scrollHeight > scrollHeight) {
                        scrollHeight = document.scrollingElement.scrollHeight //if can scroll 
                    } else {
                        flag = false;
                    }
                }
                
            })

            // await page.waitForTimeout(3000);

            // let loadReply = page.evaluate( async () => {
            //     window.scrollTo(0, 3000)
            //     console.log("loading reply of comment...")
            //     let moreReplies = document.querySelectorAll('#more-replies');
            //     moreReplies.forEach(async (item) => {
                    
            //         item.click()
            //         // await wait(400);
            //     })
            // })

            await page.waitForTimeout(3000);


            let loadMoreReply = await page.evaluate(() => {
                const wait = (ms) => new Promise(res => setTimeout(res, ms)); //delay time(ms)
                console.log("loading more reply")
                let moreReplies = document.querySelectorAll("#replies"); 
                if (moreReplies && moreReplies.length > 0) {
                    moreReplies.forEach((item, index) => {
                        if (item.childNodes.length > 0) {
                            let tmp = item.querySelector("ytd-comment-replies-renderer > #expander > #expander-contents > #contents").lastChild 
                            if (tmp && tmp.tagName === "YTD-CONTINUATION-ITEM-RENDERER") {
                                tmp.querySelector("#button > ytd-button-renderer").click();
                            } else {
                                console.log("Loaded all comment replies")
                            }

                        }
                    })
                }


            })      


            await page.waitForTimeout(3000);


            let urls = await page.evaluate(() => {

                //document.querySelector('#more-replies').click();  

                var f_total_comment_count = ""
                //get total comment count
                let comment_count = document.querySelectorAll('#comments > #sections > #header > ytd-comments-header-renderer > #title > h2 > yt-formatted-string > span')
                f_total_comment_count = comment_count[0].textContent.trim()
                // console.log(document.querySelectorAll('#contents > ytd-comment-thread-renderer').length, comment_count[0].textContent)




                var f_title = "";
                var f_user_id = "";
                var f_link = URL;
                var f_subscription_count = "";
                var f_description = "";
                var f_like = "";
                var f_total_data_count = "";

                //TODO: 전체 페이징(화면하단 스크롤 갱신 반복) 
                //TODO: 댓글이 포함되었는지 확인후 진행 

                let results = [];
                let title = document.querySelectorAll('#container > h1 > yt-formatted-string');
                
                // console.log(title[0].innerText); 
                
                title.forEach((titem) => {
                    f_title = titem.innerText;
                });
                
                let user_id = document.querySelector('#container > #text-container > yt-formatted-string > a');
                
                //my code
                f_user_id = user_id.innerText.trim();
                
                let total_sts = document.querySelector("#owner-sub-count");
                
                // console.log(total_sts.innerText)
                
                f_subscription_count = total_sts.textContent.trim();
                // f_subscription_count = total_sts.innerText;
                
                
                
                let description = document.querySelector("#description > yt-formatted-string ");
                
                
                f_description = description.textContent.trim();
                // f_description = description.innerText;
                // console.log(f_description)
                
                
                let likecnt = document.querySelector("#top-level-buttons-computed > ytd-toggle-button-renderer > a > yt-formatted-string");
                f_like = likecnt.textContent.trim();
                // f_like = likecnt.innerText;

                // console.log(f_like)


                let total_data_count = document.querySelector("#count > ytd-video-view-count-renderer > .view-count");
                f_total_data_count = total_data_count.textContent.trim();
                // f_total_data_count = total_data_count.innerText;
                // console.log(f_total_data_count)

                // -----------메인 데이터 수집 완료


                // 댓글목록
                var replylist = [];
                var replyset = [];
                let comment_thread = document.querySelectorAll('#contents > ytd-comment-thread-renderer ');
                let childcnt = 2;

                // console.log("comment thread count:" + comment_thread.length);

                if (comment_thread.length >= 1) {

                    comment_thread.forEach((citem) => {
                        // console.log("citem",citem)
                        // let comment = citem.querySelector('#comment > #body > #main > #expander > #content > #content-text');
                        let comment = citem.querySelector('#comment > #body > #main > #comment-content > #expander > #content > #content-text');
                        // console.log(comment);
                        // let f_comment = comment.textContent;

                        // try {
                        //     let tmp = comment.innerText;
                        //     console.log(tmp)
                        // } catch (e) {
                        //     console.log("bug")
                        // }

                        let f_comment = comment.textContent.trim();
                        // console.log(f_comment);

                        let author = citem.querySelector('#comment > #body > #main > #header > #header-author > h3 > #author-text > span');
                        let f_author = author.textContent.trim();
                        // console.log(f_author);
                        let vote = citem.querySelector('#comment > #body > #main > #action-buttons > #toolbar > #vote-count-middle');
                        let f_votecnt = vote.innerText.trim();

                        let childreply_list = citem.querySelector('#replies');
                        // console.log("replies count:" + childreply_list.length);

                        let f_haschild = false;

                        if (childreply_list.innerHTML != '')
                            f_haschild = true;

                        replylist.push({
                            user_id: f_author,
                            comment: f_comment,
                            likes: f_votecnt,
                            id: 1          // 댓글 : 1
                            , haschild: f_haschild
                        });

                        if (f_haschild) {
                            // 대댓글 취득

                            let f_ci_author = '';
                            let f_ci_comment = '';
                            let f_ci_votecnt = '';
                            let childreply = citem.querySelectorAll('#replies > ytd-comment-replies-renderer > #expander > #expander-contents > #contents > ytd-comment-renderer');

                            // console.log("childreply:" + childreply.length);

                            childcnt = 2; // 재세팅 id
                            childreply.forEach((childitem) => {
                                let ci_author = childitem.querySelector('#body > #main > #header > #header-author > h3 > #author-text > span');
                                f_ci_author = ci_author.innerText.trim();
                                // console.log("f_ci_author:" + f_ci_author);
                                // let ci_comment = childitem.querySelector('#body > #main > #expander > #content > #content-text')
                                let ci_comment = childitem.querySelector('#body > #main > #comment-content > #expander > #content > #content-text')

                                f_ci_comment = ci_comment.innerText.trim();
                                // f_ci_comment = ci_comment.innerText;

                                // console.log("f_ci_comment:" + f_ci_comment);
                                let ci_vote = childitem.querySelector('#body > #main > #action-buttons > #toolbar > #vote-count-middle')
                                // f_ci_votecnt = ci_vote.innerText;
                                f_ci_votecnt = ci_vote.innerText.trim();

                                // console.log("f_ci_votecnt:" + f_ci_votecnt);

                                replylist.push({
                                    user_id: f_ci_author,
                                    comment: f_ci_comment,
                                    likes: f_ci_votecnt,
                                    id: childcnt          // 대댓글 > 1
                                    , haschild: false
                                });

                                childcnt++;
                            })

                        }
                    });
                }
                // console.log(JSON.stringify(replylist));
                //console.log(replylist);

                //console.log(replylist[1]);

                results.push({
                    title: f_title,
                    user_id: f_user_id,
                    link: URL,
                    description: f_description,
                    subscription_count: f_subscription_count,
                    like: f_like,
                    total_data_count: f_total_data_count,
                    total_comments: f_total_comment_count,
                    reply: replylist
                    // reply: JSON.stringify(replylist),
                });         /*  */



                return results;
            })
            //browser.close();
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}

run().then(logJSON).catch(console.error);

function logJSON(urls) {
    var name = URL.split("=")[1]
    // console.log(urls);
    fs.writeFile(`${name}.json`, JSON.stringify(urls[0], null, "\t"),'utf8', function(err) {
        console.log(err);
    });
}

