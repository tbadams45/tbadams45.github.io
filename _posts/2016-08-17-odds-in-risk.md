---
layout: post
title: Odds of Success in Risk
description: Answering the question -- how many dice should you roll in Risk?
---

I was playing a game of Risk a few days ago with my family. As any Risk
player knows, the game is almost entirely luck-based. The dice you roll
and the cards you draw matter far more than any strategic decision you
make. This reality, coupled with the fact that most people get far more
emotionally involved than would seem warranted, means that many people
develop their own methods of beating the odds. These methods include,
but are not limited to:

1.  Rolling more or fewer dice for a roll or two
2.  Throwing the dice in an unusual way
3.  Changing which country to attack after a series of bad rolls, in
    order to "reset" the dice
4.  Screaming loudly to shock the dice into rolling 6s, or acting very
    subdued to not disturb them

While I can't speak to the efficacy of the last 3, I was quite excited
to realize that there is an easy way to evaluate the first: simulate it!
By the [Law of Large
Numbers](https://en.wikipedia.org/wiki/Law_of_large_numbers), we can
estimate the probabilites of success for each combination of number of
attacking and defending dice.

## Setting up our simulation

The first thing we need to do is recognize the algorithm we follow
whenever we roll in Risk. After declaring the country to attack and the
origin of the attack:

1.  Both the attacker and the defender pick the number of dice they
    would like to roll. The defender can roll up to 2, and the attacker
    can roll up to 3.
2.  Both players roll.
3.  After the roll, they (visually) sort their numbers from highest
    to lowest.
4.  The highest number of each player is compared against the other.
    Whoever's number is highest wins, and one of the opposing player's
    armies is removed from the board. The defender wins ties.
5.  If both of the players rolled at least two dice, the second highest
    number is also compared, in the same way as in step 4.

Each of these steps is easy to complete in R. For example, we can wrap
the `sample` function to simulate a dice roll.

{% highlight r %}
roll <- function(dice = 1) {
  sample(1:6, size = dice, replace = TRUE)
}

t(replicate(4, roll(dice = 2)))
##      [,1] [,2]
## [1,]    3    4
## [2,]    1    5
## [3,]    2    6
## [4,]    5    6
{% endhighlight %}

The rest of the code below sets up the other functions that we need. The
key function is `battle`, which uses the other functions to implement
this algorithm.

{% highlight r %}
# Get the top roll(s) for a player.
get_top <- function(roll, n) {
  num <- min(length(roll), n)
  sorted <- sort(roll, decreasing = TRUE)
  
  if(num > 2 | num <= 0) {
    stop("invalid number of dice rolled")
  }
  else if (num == 1) {
    return(sorted[1])
  }
  else {
    return(c(sorted[1], sorted[2]))
  }
}

# Compare each pair of dice. Defense wins ties.
compare <- function(attack, defense) {
  if(attack > defense){
    return("attack")
  }
  else return("defense")
}

# One dice roll from both defense and offense. 
# Resulting vector will indicate who won each comparison
battle <- function(num_d = 2, num_o = 3) {
  if(num_d < 1 | num_d > 2) {
    stop("invalid number of defensive dice rolled: must be 1 or 2")
  }
  else if(num_o < 1 | num_o > 3) {
    stop("invalid number of offensive dice rolled: must be 1, 2, or 3")
  }
  d <- roll(num_d)
  o <- roll(num_o)
  min_dice <- min(num_d, num_o)
  
  d_top <- get_top(d, min_dice)  
  o_top <- get_top(o, min_dice)
  
  if(min(num_d, num_o) == 1){
    obv <- compare(o_top[1], d_top[1])
  }
  else {
    obv <- c(compare(o_top[1], d_top[1]), compare(o_top[2], d_top[2]))
  }
  
  obv
}

# An example of the output we can expect:
battle()

## [1] "defense" "defense"

{% endhighlight %}

## Running the simulation and results

We can now run our simulation. To get an accurate result, we'll have to
call our `battle` function a large number of times for each set of
potential inputs. Because we can, we'll run it 100,000 times for each
input permutation. To ease this, and to calculate our ultimate
probabilities, we'll use a few helper functions:

{% highlight r %}

sim <- function(n, num_d, num_o) {
  t(replicate(n, battle(num_d = num_d, num_o = num_o)))
}

# probability the attacker wins
prob_attacker <- function(result) {
  length(result[result == "attack"]) / length(result)
}

prob_defender <- function(prob_attacker) {
  return(1 - prob_attacker)
}

{% endhighlight %}

And now, for our calculation of our actual results. We'll build two
matrices: the row index will indicate how many dice the defender rolls,
while the column index will indicate the same for the attacker.
    
{% highlight r %}

attacker_likelihood <- matrix(data = NA, nrow = 2, ncol = 3)

for(i in 1:2) {
  for (j in 1:3) {
    attacker_likelihood[i, j] <- prob_attacker(sim(n = 100000, num_d = i, num_o = j))
  }
}

{% endhighlight %}

This takes ~30-45 seconds to run on my computer. Here are the results
that I found, looking at the probability of success on the
**attacker's** side:

|--------------------+----------------+----------------+----------------|
|  Attacker Success  | Attack rolls 1 | Attack rolls 2 | Attack rolls 3 | 
|:------------------:|:--------------:|:--------------:|:--------------:|
| Defense rolls 1    |      0.4178    |    **0.5775**  |    **0.6589**  |
|--------------------+----------------+----------------+----------------|
| Defense rolls 2    |      0.2553    |      0.3909    |    **0.5402**  |  
|====================+================+================+================|

And on the **defender's** side:

|--------------------+----------------+----------------+----------------|
|  Defender Success  | Attack rolls 1 | Attack rolls 2 | Attack rolls 3 | 
|:------------------:|:--------------:|:--------------:|:--------------:|
| Defense rolls 1    |    **0.5822**  |      0.4225    |      0.3411    |
|--------------------+----------------+----------------+----------------|
| Defense rolls 2    |    **0.7447**  |    **0.6091**  |      0.4598    |  
|====================+================+================+================|

I was interested to see that in the classic "showdown" setting (attacker
rolls 3, defender rolls 2), the attacker has a slight advantage (54%).
In general, however, there's one clear message from these numbers:
always roll as many dice as you can in Risk!

(Note: If you're interested in a much deeper statistical analysis of Risk, you might want
to check out [this article](http://www.datagenetics.com/blog/november22011/). There's also a paper written by an MIT grad on [the strategy of Risk](http://web.mit.edu/sp.268/www/risk.pdf).)
