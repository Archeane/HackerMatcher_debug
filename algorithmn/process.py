import zerorpc
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['test']

#currentHacker = db['users'].find_one({'email':'f@f.com'})
#allHackers = db['users'].find()

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
    if not hasattr(currentHacker['prefences'], category) and hasattr(hacker['preferences', category]):
        return 0
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
    interestscore = calculatecategoryscore(currentHacker, carescores, hacker, 'interests')
    languagescore = calculatecategoryscore(currentHacker, carescores, hacker, 'languages')
    technologiesscore = calculatecategoryscore(currentHacker, carescores, hacker, 'technologies')
    fieldsscore = calculatecategoryscore(currentHacker, carescores, hacker, 'fields')
    return interestscore + languagescore + technologiesscore + fieldsscore


def calculateallscores(currentHacker, allHackers):
    totalscores = []
    # checking if current hacker contains all the needed fields
    if hasattr(currentHacker, 'careScores') && hasattr(currentHacker, 'preferences')
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
        currentHackathon = db['hackathons'].find_one({'name': hackathon})
        #TODO: get hackathon hackers from database
        allHackers = db['users'].find()
        arr = calculateallscores(currentHacker, allHackers)
        return arr

s = zerorpc.Server(HelloRPC())
s.bind("tcp://0.0.0.0:4242")
s.run()
