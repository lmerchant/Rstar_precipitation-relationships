# R* Graphs

My thoughts about what graphs to produce to represent dataset metadata. These are initial ideas and not finalized.

## graphs needed

will need two graphs. a weighted network graph for R* scores and a knowled graph that serves as input to information nodes on the network graph. I'm not sure how I would hook them up. Could make a nodes needed map and then connect them up that way when the information comes in. How do you do that live?

with the R* graph, the input adds information nodes and that can be displayed so a decision can be made

## For each dataset

What is the strength of the score to each of the 4 R star nodes or the total of 18 subgroups

But there are 5 questions for the dataset repo alone. A dataset can exist in more than one repo. Want to find out which repo have the most risk


The higher the score, the higher the risk. So want thick red joining lines to represent risk

For repo, need to calculate by subtracting score from 100

—-

make these R* weighted network graphs for each dataset.

---


## R* definition

R* is composed of 4 groups (D, P, RRS, DIRS)

Group definitions

1. D = Data risk
2. P = People risk
3. RRS = Repository resilience risk
4. DIRS = Dependent infrastructure resilience risk

## Scoring formula for group nodes and R*

### R* node value

```
rstar = d_total*0.40 + p_total*0.30 + (100 - rrs_total)*0.20 + dirs_total*0.10
```

### Data risk node values

Data risk items have format D-#

Point values

```
D-# can only have values in the set and start at 0

d_1 = {0,30}
d_2 = {0,25}
d_3 = {0,20}
d_4 = {0,15}
d_5 = {0,10}

d_total = d_1 + d_2 + d_3 + d_4 + d_5

```

### People risk node values

People risk items have format P-#

Point values

```
P-# can only have values in the set and start at 0

p_1 = {0,35}
p_2 = {0,25}
p_3 = {0,20}
p_4 = {0,15}

p_total = p_1 + p_2 + p_3 + p_4

```

### Repository resilience risk node values

Repository risk items have format RRS-#

Point values

```
RRS-# can only have values in the set and start at 0

rrs_1 = {0,25}
rrs_2 = {0,20}
rrs_3 = {0,20}
rrs_4 = {0,20}
rrs_5 = {0,15}

rrs_total = rrs_1 + rrs_2 + rrs_3 + rrs_4 + rrs_5

```

### Dependent infrastructure resilience risk node values

Dependent infrastructure resilience risk items have format DIRS-#

Point values

```
DIRS-# can only have values in the set and start at 0

dirs_1 = {0,25}
dirs_2 = {0,20}
dirs_3 = {0,20}
dirs_4 = {0,20}
dirs_5 = {0,15}

dirs_total = dirs_1 + dirs_2 + dirs_3 + dirs_4 + dirs_5

```

## Information nodes

Each of the D, P, RRS, and DIRS nodes are composed of their sub nodes starting with D-#, P-#, RRS-#, DIRS-#.

Each sub node is given a value from their set depending on the quality of information that exists for each sub node. The information is needed to make a decision about which value from the set to choose for each sub node. If there isn't enough information, the default value is 0.


## Weighted network graph

A weighted network graph can be created for a dataset represented by a node with an R* value. The 4 groups of R* are connected to the R* node with edges weighted with their point values. Each group has subnodes and they are connected to an R* group with edges weighted with their point values.

## Add information nodes to the graph

There are information nodes for each group of the R* connected nodes. They will come from JSON files where the R* group sub node name will be a key and there will multiple information values for that key in a list.

Or should the information nodes remain markdown text? I'll split the about dataset pages into markdown files for each subnode type. So a file datasetname-p-1.md would hold info related to the People Risk #1 sub node.

Like multiple JSON files of text for each subgroup node key?

---

## Knowledge graph

The information nodes are also part of a knowledge graph where multiple datasets will be connected together. With this, it's not broken down into subgroup nodes. It would be broken down into metadata keys so I could match on the key and values easier.

So one dataset could have a key = "composed-of-datasets" and then the value is a list of datasets that compose it. And for each dataset node name, it will have multiple keys associated with it.

---

## Method to split web research files into JSON

First split markdown files into a file with supporting information for each R* question. Then turn into json

Will create a node with a total R* score as its value

Then lines connecting total R* score to each of the 4 sub groups and their score as values. The lines connecting the total score node to the subgroups will have weighted edges with the subgroup scores. So the thicker the line, the higher the score.

The subgroup nodes will all have a different color along with a sub group abbreviation

What will determine thickness width? Start with all nodes having the same formula of the percentage of the highest value for a sub group when nodes connected to a sub group via directional lines indicating direction score is contributing to. And for the lines from central node to subgroups. The line thickness is their score as a percentage of the highest R* score.

For each of the individual score nodes for all the subgroups, now have lines reaching out to all the json keys contributing to it. So all the json keys that went into a score checked off or not: contributing or not.

This time, instead of contributing json key lines being thick or thin, they will just be lines of some neutral color.

And if there is no incoming information to a subgroup node, the sub query node will be black. (Meaning there is not enough info to determine a score). The other subgroup json query nodes will be smaller than the subgroup node

Each sub query node will be the same color as the subgroup node and smaller in size. The line thickness carries the score. The rstar query node has its identifier in it as the value

—-

For Russian doll derived datasets, the json key nodes contributing to a checkbox score on or off will indicate how much information is available to make a decision.  How will they do that? Maybe by the quantity of information nodes surrounding it?

——

Can the information nodes be differentiated if they have information of a sub dataset that is contributing information to the main rstar dataset?

Maybe a thicker line on information edges if they come from another dataset?

So if an information node to a subgroup query node is from another dataset, it has a thick line. Fixed widths. Either thick or thin.

Example is an information node created from information about dependent datasets. This json information node would have a thick edge into the subgroup rstar query node. But then all subgroup rstar query nodes asking for information on datasets would be thick. But that information may not be important if the derived dataset is properly funded as opposed to a derived dataset that is about to have its budget cut and possibly end and not be replaced. But information is also important if it isn’t going to be cut.

—-

Need a separate graph for showing connections between datasets. And show total R* for a dataset related to another total R* contributing data

—-

So one graph is a knowledge graph of connections. This informs the information nodes in the weighted dataset graph.

Dataset to dataset connections, dataset to repository connections, Datasets to people connections, dataset to instrument connections. I get that from dataset, repository and instrument metadata json files. This comes from the web searches and dataset metadata files from ChatGPT

—-

Another graph is a weighted graph of contributing information to the total dataset R* value

—-

The values of the knowledge graph are information nodes. The information nodes determine the subgroup query node on/off status for a query score. The subgroup query scores determine the central rstar total score
