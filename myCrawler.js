const puppeteer = require("puppeteer");
const fs = require("fs");
// const { scrollPageToBottom } = require('puppeteer-autoscroll-down');

// var target = "https://www.youtube.com/watch?v=Z8nbb0ELUl0";
// const target = "https://www.youtube.com/watch?v=_M71wCMxT3o"
// const target = "https://www.youtube.com/watch?v=K9_VFxzCuQ0"
// var target = "https://www.youtube.com/watch?v=DcCISK3sCYg""https://www.youtube.com/watch?v=K9_VFxzCuQ0"

var target = ["https://www.youtube.com/watch?v=_M71wCMxT3o", "https://www.youtube.com/watch?v=_M71wCMxT3o", "https://www.youtube.com/watch?v=K9_VFxzCuQ0", "https://www.youtube.com/watch?v=DcCISK3sCYg"]

//var URL = "https://www.youtube.com/watch?v=kxcQ7MUeLeI";

function run(tg = "", to = -1) {

    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                //dumpio: true,
                args: ["--window-size=1024,1024"],
                ignoreDefaultArgs: ["--mute-audio"],
            });

            console.log("target: ", tg);

            const page = await browser.newPage();
            await page.goto(tg);

            page.on("console", (msg) => {
                for (let i = 0; i < msg.args().length; ++i)
                    console.log(`${i}: ${msg.args()[i]}`);
                // printLogAt_67(msg.args())
            });


            await page.waitForResponse((response) => {
                console.log(response.status());
                // TODO: 크롤링 종료를 위한 graceful 처리.
                if (response.status() === 200 || response.status() === 204) {
                } else {
                }
                return true;
            });

            await page.waitForTimeout(3000);
            console.log("start crawling");

            const getContent = async (page, tg, to) => {
                await page.evaluate(async () => {
                    window.scrollTo(0, document.scrollingElement.scrollHeight); //scroll to load more comments
                });

                await page.waitForTimeout(3000)

                await page.evaluate(async () => {
                    let commentsNode = document.querySelectorAll(
                        "ytd-comment-thread-renderer"
                    );
                    commentsNode[commentsNode.length - 1].scrollIntoView({
                        behavior: "smooth",
                        block: "end",
                        inline: "end",
                    })
                });



                let loadComments = await page.evaluate(async (to) => {
                    // let scroller = scrollPageToBottom
                    console.log("time", to)
                    const wait = (ms) => new Promise((res) => setTimeout(res, ms)); //delay function()
                    await wait(1000);
                    let scrollHeight = 0;
                    let flag = true;

                    //crawl will end when timeout (ms)
                    if (1 !== -1 && 1 > 0) {
                        setTimeout(() => {
                            flag = false;
                            console.log("Timeout..");
                        }, to);
                    }

                    let j = 0;

                    while (flag) {
                        let moreReplies = document.querySelectorAll("#more-replies");

                        await wait(200);

                        for (j; j < moreReplies.length; j++) {
                            moreReplies[j].click()
                        }

                        j = moreReplies.length

                        await wait(200);

                        let commentsNode = document.querySelectorAll(
                            "ytd-comment-thread-renderer"
                        );


                        let i;
                        if (commentsNode.length >= 20) {
                            i = commentsNode.length - 20
                        } else {
                            i = 0
                        }
                        while (i !== commentsNode.length) {
                            if (commentsNode[i].querySelector("#replies > ytd-comment-replies-renderer")) {
                                commentsNode[i].scrollIntoView({
                                    block: "end",
                                    inline: "end",
                                });

                                console.log(wait)

                                await wait(600);
                            }
                            i++;
                        }


                        window.scrollTo(0, document.scrollingElement.scrollHeight); //scroll to load more comments

                        scrollHeight = document.scrollingElement.scrollHeight

                        await wait(1000); // wait 400ms
                        if (document.scrollingElement.scrollHeight > scrollHeight) {
                            scrollHeight = document.scrollingElement.scrollHeight
                        } else {
                            flag = false;
                        }
                    }
                }, to);

                await page.waitForTimeout(500);

                let reload = await page.evaluate(async () => {
                    let moreReplies = document.querySelectorAll("#more-replies");
                    moreReplies.forEach(async (item) => {
                        item.click();
                    });
                });

                await page.waitForTimeout(3000);
                let loadMoreReply = await page.evaluate(() => {
                    const wait = (ms) => new Promise((res) => setTimeout(res, ms)); //delay time(ms)
                    // console.log("loading more reply")
                    let moreReplies = document.querySelectorAll("#replies");
                    if (moreReplies && moreReplies.length > 0) {
                        moreReplies.forEach((item) => {
                            if (item.childNodes.length > 0) {
                                let tmp = item.querySelector(
                                    "ytd-comment-replies-renderer > #expander > #expander-contents > #contents"
                                );
                                if (tmp["lastChild"]) {
                                    let lastChild = tmp.lastChild;
                                    if (
                                        lastChild &&
                                        lastChild.tagName === "YTD-CONTINUATION-ITEM-RENDERER"
                                    ) {
                                        if (
                                            lastChild.querySelector("#button > ytd-button-renderer")[
                                            "click"
                                            ] !== undefined
                                        ) {
                                            try {
                                                lastChild
                                                    .querySelector("#button > ytd-button-renderer")
                                                    .click();
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                });

                await page.waitForTimeout(3000);
                let urls = await page.evaluate(() => {
                    //document.querySelector('#more-replies').click();

                    var f_total_comment_count = "";
                    //get total comment count
                    let comment_count = document.querySelectorAll(
                        "#comments > #sections > #header > ytd-comments-header-renderer > #title > h2 > yt-formatted-string > span"
                    );
                    f_total_comment_count = comment_count[0].textContent.trim();

                    var f_title = "";
                    var f_user_id = "";
                    // var f_link = URL;
                    var f_subscription_count = "";
                    var f_description = "";
                    var f_like = "";
                    var f_total_data_count = "";

                    //TODO: 전체 페이징(화면하단 스크롤 갱신 반복)
                    //TODO: 댓글이 포함되었는지 확인후 진행

                    let results = {};
                    let title = document.querySelectorAll(
                        "#container > h1 > yt-formatted-string"
                    );


                    title.forEach((titem) => {
                        f_title = titem.innerText;
                    });

                    let user_id = document.querySelector(
                        "#container > #text-container > yt-formatted-string > a"
                    );

                    //my code
                    f_user_id = user_id.innerText.trim();

                    let total_sts = document.querySelector("#owner-sub-count");


                    f_subscription_count = total_sts.textContent.trim();
                    // f_subscription_count = total_sts.innerText;

                    let description = document.querySelector(
                        "#description > yt-formatted-string "
                    );

                    f_description = description.textContent.trim();
                    // f_description = description.innerText;

                    let likecnt = document.querySelector(
                        "#top-level-buttons-computed > ytd-toggle-button-renderer > a > yt-formatted-string"
                    );
                    f_like = likecnt.textContent.trim();
                    // f_like = likecnt.innerText;


                    let total_data_count = document.querySelector(
                        "#count > ytd-video-view-count-renderer > .view-count"
                    );
                    f_total_data_count = total_data_count.textContent.trim();
                    // f_total_data_count = total_data_count.innerText;

                    // -----------메인 데이터 수집 완료

                    // 댓글목록
                    var replylist = [];
                    var replyset = [];
                    let comment_thread = document.querySelectorAll(
                        "#contents > ytd-comment-thread-renderer "
                    );
                    let childcnt = 2;


                    if (comment_thread.length >= 1) {
                        comment_thread.forEach((citem) => {
                            // console.log("citem",citem)
                            // let comment = citem.querySelector('#comment > #body > #main > #expander > #content > #content-text');
                            let comment = citem.querySelector(
                                "#comment > #body > #main > #comment-content > #expander > #content > #content-text"
                            );

                            let f_comment = comment.textContent.trim();
                            // console.log(f_comment);

                            let author = citem.querySelector(
                                "#comment > #body > #main > #header > #header-author > h3 > #author-text > span"
                            );
                            let f_author = author.textContent.trim();
                            let vote = citem.querySelector(
                                "#comment > #body > #main > #action-buttons > #toolbar > #vote-count-middle"
                            );
                            let f_votecnt = vote.innerText.trim();

                            let childreply_list = citem.querySelector("#replies");

                            let f_haschild = false;

                            if (childreply_list.innerHTML != "") f_haschild = true;

                            replylist.push([{
                                user_id: f_author,
                                comment: f_comment,
                                likes: f_votecnt,
                                id: 1, // 댓글 : 1
                                haschild: f_haschild,
                            }]);

                            if (f_haschild) {
                                // 대댓글 취득

                                let f_ci_author = "";
                                let f_ci_comment = "";
                                let f_ci_votecnt = "";
                                let childreply = citem.querySelectorAll(
                                    "#replies > ytd-comment-replies-renderer > #expander > #expander-contents > #contents > ytd-comment-renderer"
                                );


                                childcnt = 2; // 재세팅 id
                                childreply.forEach((childitem) => {
                                    let ci_author = childitem.querySelector(
                                        "#body > #main > #header > #header-author > h3 > #author-text > span"
                                    );
                                    f_ci_author = ci_author.innerText.trim();

                                    // let ci_comment = childitem.querySelector('#body > #main > #expander > #content > #content-text')
                                    let ci_comment = childitem.querySelector(
                                        "#body > #main > #comment-content > #expander > #content > #content-text"
                                    );

                                    f_ci_comment = ci_comment.innerText.trim();
                                    // f_ci_comment = ci_comment.innerText;

                                    let ci_vote = childitem.querySelector(
                                        "#body > #main > #action-buttons > #toolbar > #vote-count-middle"
                                    );
                                    // f_ci_votecnt = ci_vote.innerText;
                                    f_ci_votecnt = ci_vote.innerText.trim();


                                    replylist[replylist.length - 1].push({
                                        user_id: f_ci_author,
                                        comment: f_ci_comment,
                                        likes: f_ci_votecnt,
                                        id: childcnt, // 대댓글 > 1
                                        haschild: false,
                                    });

                                    childcnt++;
                                });
                            }
                        });
                    }

                    results = {
                        title: f_title,
                        user_id: f_user_id,
                        description: f_description,
                        subscription_count: f_subscription_count,
                        like: f_like,
                        total_data_count: f_total_data_count,
                        total_comments: f_total_comment_count,
                        reply: replylist,
                        // reply: JSON.stringify(replylist),
                    }; /*  */

                    return results;
                });
                browser.close();
                return resolve(urls);
            };

            getContent(page, tg, to); //start crawling

        } catch (e) {
            return reject(e);
        }
    });

}

// target.forEach(item => {
//     run().then(logJSON).catch(console.error)
// })

run(target[0], 300000).then(logJSON).catch(console.error);
// run(target[0], 1).then(logJSON).catch(console.error);
// run(target[0], 1).then(logJSON).catch(console.error);
// run(target[0], 1).then(logJSON).catch(console.error);


function logJSON(urls) {
    var name = target[0].split("=")[1];
    urls.link = target[0];
    console.log(urls);
    fs.writeFile(
        `${name}.json`,
        JSON.stringify(urls, null, "\t"),
        "utf8",
        function (err) {
            console.log(err);
        }
    );
}
