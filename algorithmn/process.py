import zerorpc
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['test']



def calculatecarescores(hacker):
    interestscore = hacker['careScores']['interests']
    langscore = hacker['careScores']['languages']
    techscore = hacker['careScores']['technologies']
    fieldscore = hacker['careScores']['fields']
    sum = interestscore + langscore + techscore + fieldscore
    carescores = {}
    carescores['interests'] = round(interestscore/sum,3)
    carescores['languages'] = round(langscore/sum,3)
    carescores['technologies'] = round(techscore/sum,3)
    carescores['fields'] = round(fieldscore/sum,3)
    return carescores

def calculatecategoryscore(currentHacker, carescores, hacker, category):
    #print(currentHacker['preferences'][category])
    #print(hacker['preferences'][category])
    # TODO: handle when hacker does not have this cateorgy
    #if not(hasattr(currentHacker['preferences'], category) or hasattr(hacker['preferences', category])):
    #    return 0

    arr1 = currentHacker['preferences'][category]
    arr2 = hacker['preferences'][category]
    multiplier = carescores[category]
    if len(arr1) == 0 or len(arr2) == 0:
        return 0
    if arr1[0] == None or len(arr1[0]) == 0 or arr1[0][0] == '' or arr1[0][1] == '' or arr2[0] == None or len(arr2[0]) == 0 or arr2[0][0] == '' or arr2[0][1] == '':
        return 0

    scoresum = 0
    for element in arr1:
        for matching in arr2:
            if element[0] == matching[0]:
                scoresum += min(int(element[1]), int(matching[1]))
    scoresum = scoresum*multiplier
    return scoresum

def calculatehackerscore(currentHacker, carescores, hacker):
    interestscore = 0
    languagescore = 0
    technologiesscore = 0
    fieldsscore = 0
    if(len(currentHacker['preferences']['interests']) != 0 or carescores['interests'] == 0):
        interestscore = calculatecategoryscore(currentHacker, carescores, hacker, 'interests')
    if (len(currentHacker['preferences']['languages']) != 0 or carescores['languages'] == 0):
        languagescore = calculatecategoryscore(currentHacker, carescores, hacker, 'languages')
    if (len(currentHacker['preferences']['technologies']) != 0 or carescores['technologies'] == 0):
        technologiesscore = calculatecategoryscore(currentHacker, carescores, hacker, 'technologies')
    if (len(currentHacker['preferences']['fields']) != 0 or carescores['fields'] == 0):
        fieldsscore = calculatecategoryscore(currentHacker, carescores, hacker, 'fields')
    return interestscore + languagescore + technologiesscore + fieldsscore


def calculateallscores(currentHacker, allHackers):
    totalscores = []
    # checking if current hacker contains all the needed fields
    if hasattr(currentHacker, 'careScores') and hasattr(currentHacker, 'preferences'):
        return []
    carescores = calculatecarescores(currentHacker)
    #print(calculatehackerscore(currentHacker, carescores, allHackers[13]))

    for hacker in allHackers:
        similiarity = calculatehackerscore(currentHacker, carescores, hacker)
        if similiarity != 0:
            temp = [hacker['email'], similiarity]
            totalscores.append(temp)

    totalscores = sorted(totalscores, key=lambda l:l[1], reverse=True)
    return totalscores


class HelloRPC(object):
    def hello(self, user, hackathon):
        currentHacker = db['users'].find_one({'email':user})
        #currentHackathon = db['hackathons'].find_one({'name': hackathon})
        allHackersEmail = db['hackathons'].find_one({'name': hackathon})
        allHackersEmail = allHackersEmail['hackers']
        allHackers = []
        for email in allHackersEmail:
            hacker = db['users'].find_one({'email': email})
            if hacker != None:
                allHackers.append(hacker)
        print(allHackers)
        arr = calculateallscores(currentHacker, allHackers)
        print(arr)
        return arr

s = zerorpc.Server(HelloRPC())
s.bind("tcp://0.0.0.0:4242")
s.run()
