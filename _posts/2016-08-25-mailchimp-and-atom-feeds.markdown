---
title: Mailchimp and Atom Feeds
layout: post
---

I've been trying to get my email newsletter up and running... Seems harder than it should be. 

At the moment, the issue seems to be a question of standards. For a blog like the kind I'm writing, [Mailchimp](http://mailchimp.com/) (my email service provider) expects an RSS feed. Because I set up my blog on Github, I have an Atom feed instead (tbadams.com/atom.xml). This isn't obviously a problem - Mailchimp didn't complain when I gave it the link to my feed, and everything seemed to work. Except that no emails were sent. 

I talked to Mailchimp support and they said it comes down to the [pubDate tag](http://kb.mailchimp.com/campaigns/rss-in-campaigns/troubleshooting-rss-in-campaigns#The-send-time-for-my-RSS-Campaign-is-later-than-the-scheduled-time). This is a tag that's used in RSS 2.0, but not in Atom. Apparently, the absense of this tag can cause errors in emails being sent out by Mailchimp.

I've hacked the two formats by simply adding the pubDate tag to my atom.xml file. If you're reading this in your mailbox, it means it has...
