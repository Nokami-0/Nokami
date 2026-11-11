"""Rebuild playable upload variants; preserve recovered authored profiles."""
import copy, json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
ID = 'sonic-tag-team-heroes'
VERSION = '2.0.12'
def read(name): return json.loads((ROOT/'data'/f'{name}.json').read_text())
def write(name, rows): (ROOT/'data'/f'{name}.json').write_text(json.dumps(rows, indent=2, ensure_ascii=False)+'\n')
def norm(s): return re.sub('[^a-z0-9]', '', s.lower())
roster = read('eggman-empire')
art = read('token-art')
# Explicit encounter roles for uploads that have no recovered authored profile.
# These are community encounter designs, not a claim of official game statistics.
groups = {
 'scout': 'E-1000|E-1000alt|Eggbot|technosqeak|leon|stealth eggbot|Cluckoid|Anton|Crawl',
 'soldier': 'thunder bolts eggpawn|solidpawn|SCR-GP|eggpawn(casinogreen)|eggpawn(casino)|egg swat|Demoneggpawn|Egg pawn chef|egg chef|eggmusicplayer',
 'gunner': 'E-112|eggpawnblaster|Egg Gunner|catablaster|camron|Mole cannon|egg aro cannon',
 'missile': 'missile eggrobo|eggpawn bazooka|Bombbearer|Burster',
 'duelist': 'Samurieggpawn|Egg pawn lancer|Egg fighter chainsaw sword',
 'shield': 'Egg fighter swordand shield|Egg pawn lancerand shield|Egg fighter bumpershield|Egg fighter energy shield and sword|Egg fighter energy shield',
 'commander': 'Eggpawnliutenent|eggpawn manager|Eggman empire ship captain',
 'flyer': 'flapper|solid flapper|Pobee|laser dragonflys|Hotaru|Galga bee|Dragonfly|Butteriod|Egg eagle',
 'aquatic': 'seaflapper|sharkmissle|jellyfish|Egg squid',
 'digger': 'Madmole|Miner eggpawm|Drilleroid|Drillbot|burrobot forman',
 'charger': 'Eggchase2|Raptor|Fire rhino|egg rex|eggcrusher|apeape|asterion|BigChaser|eggpawnrider|eggpawnriderred|Egg rider 1',
 'hazard': 'Thunder ball|Shivesaw|Shackle|Ice ball|Gravation|Flameworm|Eletro-spinner|Catakiller|bowling spin|goldenbank',
 'brute': 'Tribot|Sweeper|polerbear|Gustav turtle|Grabber|Egg Boxer',
 'elite': 'young speedy|Speedy|Shadow andriodtype2|Shadow andriod6|Shadow andriod5|Shadow andriod4|Shadow andriod3|Shadow andriod2|Shadow andriodtype5|Shadow andriodtype4|Shadow andriodtype3|Shadow andriod|Goldshadow android|Silver sonic mk2|rocketmetal|metal amy|metal tails|Metal Tails MK2|Metal knuckles|E-2000R|SCR-HD',
 'boss': 'Big Arms|Egg Beater|Egg albtross|Egg Beetle|egg booster|Egg Devil ray|Egg dealer|Egg Emperor|Egg hornet|Egg Hawk|Egg hammermk2|super egg robo|Giant Egg walker|Egg Shogun|egg scarab|Egg Salamander|Egg Viper|Egg Wyvern|Egg walker mk 2|starl mobile|Super Neo Metal|rotatatron|rotatinator|Nega wisp|Neo metal|metal overlord|Egg genesis|Egg interceptor|Egg cauldran|Cooperation Mecha Group|BFB',
 'vehicle': 'Cop speerder|propeller egg moblie|Egg press cannon|egg mobile1.5|egg mech|egg mobile missile type|egg mobile modified|Egg mobile mk2|tunnelbot(piloted)|Rhinotank|Rhinoliner|Egg-tank|bull train',
 'carrier': 'death egg|Egg bomber ship|Egg Balloon|Egg Base|Metal carrier|Flying Battery|Eggman space ship|Eggcarier|Partyship|Egg Carrier|Egg Carrier(transformed)|blotfish tranport',
}
roles = {norm(name): role for role,names in groups.items() for name in names.split('|')}
# Alternate images of already authored profiles inherit those exact statistics.
aliases = {'metalbase':'Metal Fighter Prototype','eggsorcerer':'Egg Magician','e2000flymode':'E-2000'}
# speed,power,dexterity,intellect,charisma, HP,Dodge,Initiative,Move,rank,damage,range
specs = {
 'scout':(4,1,3,2,1,10,3,2,4,1,4,4),
 'soldier':(2,2,2,1,1,10,1,1,2,1,5,1),
 'gunner':(2,2,3,2,1,15,2,1,2,2,6,6),
 'missile':(2,2,3,1,1,15,1,1,2,2,8,8),
 'duelist':(3,3,3,1,1,20,2,2,3,2,7,1),
 'shield':(2,3,2,1,1,25,2,1,2,2,6,1),
 'commander':(3,3,3,3,3,25,2,2,3,2,7,6),
 'flyer':(3,1,3,2,1,10,2,2,3,1,4,5),
 'aquatic':(3,2,3,1,1,15,2,1,3,1,5,4),
 'digger':(2,3,2,2,1,20,1,1,2,2,7,1),
 'charger':(4,3,2,1,1,20,2,2,4,2,7,1),
 'hazard':(3,2,2,1,1,15,2,1,3,1,5,1),
 'brute':(2,4,2,1,1,30,1,1,2,2,9,1),
 'elite':(4,4,4,3,2,40,3,3,4,3,9,6),
 'boss':(4,5,4,4,3,70,3,3,4,3,12,8),
}
def item(name,typ,**system): return {'name':name,'type':typ,'system':{'slots':0,'source':'Community homebrew — untested',**system}}
def talent(name,text): return item(name,'talent',description=text,**({'modifier':'immune','modifierTarget':'suffocating','modifierValue':1} if name=='Suffocation Immunity' else {}))
def attack(name,damage,range_=1): return item(name,'attack',skill='melee' if range_==1 else 'ranged',damage=damage,damageMode='fixed',range=range_,description='Action; one target; normal attack and defense rules. No automatic status or extra attacks.')
def design(name, role, img):
 bio = (f'Original STTH game by McShmoodle. Community homebrew {role} encounter profile for the uploaded {name} artwork; not printed STTH statistics. Untested starting encounter values; adjust to your party. '
        'All attacks spend the normal Action phase; multiple listed attacks are choices, not additional actions. Special movement and traits require GM adjudication unless the sheet explicitly automates them.')
 if role in ('vehicle','carrier'):
  carrier=role=='carrier'; hp=150 if carrier else 40
  system={'speed':2 if carrier else 3,'power':6 if carrier else 4,'dexterityModifier':-2 if carrier else 0,'hp':{'value':hp,'max':hp},'dodge':1 if carrier else 2,'movement':2 if carrier else 4,'critThreshold':3 if carrier else 1,'passengers':20 if carrier else 1,'width':4 if carrier else 2,'length':8 if carrier else 2,'personal':False,'qualities':'Homebrew encounter chassis; assign pilot before vehicle actions.','bio':bio+' Large ships and bases are encounter abstractions: use separate objectives or sections for full-scale assaults. Crew and capacity are provisional.','form':name}
  items=[item('Mounted Cannon','vehicleWeapon',skill='ranged',damage=12 if carrier else 8,damageMode='fixed',range=12 if carrier else 8,description='Action; one target; uses the assigned pilot. No automatic area damage.'),talent('Crewed Chassis','Assign an appropriate pilot Actor for maneuvers and weapon attacks. The vehicle does not gain an autonomous extra turn.')]
  return {'name':name,'type':'vehicle','img':img,'system':system,'items':items}
 sp,pw,dx,it,ch,hp,dodge,init,move,rank,dmg,rng=specs[role]
 skills={'melee':rank,'ranged':rank if rng>1 else 0,'perceive':1,'resolve':1}
 system={'attributes':dict(zip(['speed','power','dexterity','intellect','charisma'],[sp,pw,dx,it,ch])),'skills':skills,'hp':{'value':hp,'max':hp},'hpBonus':hp-(5*pw+5),'tp':{'value':0,'max':15},'profileDodge':dodge,'profileInitiative':init,'profileMovement':move,'npcTier':'Boss' if role=='boss' else 'Elite' if role in ('elite','commander') else 'Henchman','heroType':'fly' if role=='flyer' else 'power' if pw>=sp else 'speed','species':'Eggman Empire','profileSource':f'Community homebrew — {role} encounter profile; untested','bio':bio,'squadSize':1,'squadSkills':''}
 titles={'scout':'Light Blaster','soldier':'Chassis Strike','gunner':'Blaster','missile':'Missile Launcher','duelist':'Weapon Strike','shield':'Guarded Strike','commander':'Command Blaster','flyer':'Airborne Shot','aquatic':'Waterborne Shot','digger':'Drill Strike','charger':'Charging Strike','hazard':'Hazard Strike','brute':'Heavy Strike','elite':'Energy Shot','boss':'Heavy Weapon'}
 items=[attack(titles[role],dmg,rng)]
 if rng>1: items.append(attack('Close Strike',max(3,dmg-2)))
 if role=='flyer': items.append(talent('Can Fly',f'Fly up to {move} squares using a normal Move. No free movement or extra action.'))
 if role=='aquatic': items.append(talent('Swimmer',f'Swim up to {move} squares using a normal Move. This profile gains no flight.'))
 if role=='digger': items.append(talent('Excavator','GM may allow normal Move through loose earth. Cannot pass through solid structures or attack while fully concealed underground.'))
 if role=='shield': items.append(talent('Shield Guard','Listed HP and Dodge include the defensive loadout. No additional passive damage reduction or automatic block.'))
 if role=='commander': items.append(talent('Unit Commander','Use normal teamwork rules to assist allies; this does not grant extra turns or attacks.'))
 if role=='missile': items.append(talent('Launcher Cycle','After firing the missile launcher, spend Interact to reload before firing it again. GM tracks this; no automatic area damage.'))
 if role in ('elite','boss'): items.append(attack('Heavy Melee Strike',dmg+1))
 if role=='hazard': items.append(talent('Contact Hazard','Use Hazard Strike as an ordinary attack. Merely approaching or touching the token does not automatically deal damage.'))
 if role=='scout' and any(w in norm(name) for w in ['stealth','leon']):
  system['skills']['sneak']=2;items.append(talent('Concealment','Use normal Sneak versus Perceive. No automatic invisibility or guaranteed surprise.'))
 if 'shadow' in norm(name): items.append(talent('Android Replica','A robotic replica. No Chaos Control, teleportation or character-specific powers are granted by appearance.'))
 if role=='boss': items.append(talent('Boss Encounter','One normal turn and one HP pool. Additional phases, invulnerability windows and arena mechanisms are not automated.'))
 items.append(talent('Suffocation Immunity','Robotic chassis does not breathe. This grants no immunity to drowning movement restrictions or other damage types.'))
 return {'name':name,'type':'npc','img':img,'system':system,'items':items}

byimg={r.get('img'):r for r in roster}
byname={norm(r['name']):r for r in roster}
playable=[]; new=0; inherited=0
for raw in art:
 name=raw['name'].removesuffix(' [Token Art]'); img=raw['img']; key=norm(name)
 source=byimg.get(img) or byname.get(key) or byname.get(norm(aliases.get(key,'')))
 if source:
  row=copy.deepcopy(source); inherited+=1
 else:
  if key not in roles: raise ValueError('Missing deliberate encounter role: '+name)
  row=design(name,roles[key],img);new+=1
 row['name']=name;row['img']=img
 row['prototypeToken']={'name':name,'actorLink':False,'texture':{'src':img},'disposition':-1,'bar1':{'attribute':'hp'}}
 if key=='e2000flymode':
  row['system']['attributes']['speed']=5;row['system']['profileMovement']=6
  row.setdefault('flags',{}).setdefault(ID,{})['form']='flight'
 flags=row.setdefault('flags',{}).setdefault(ID,{})
 flags.update(tokenArtKey=raw['flags'][ID]['tokenArtKey'],uploadedRosterVersion=VERSION)
 for embedded in row.get('items',[]): embedded['img']=img
 playable.append(row)
 if not source:
  faction=copy.deepcopy(row);faction['flags'][ID].update(eggmanKey=name,communityRosterVersion=VERSION)
  roster.append(faction)
 # Variants with inherited stats live in the uploaded collection, avoiding duplicate faction entries.
for row in roster:
 flags=row.setdefault('flags',{}).setdefault(ID,{})
 flags['eggmanKey']=row['name'];flags['communityRosterVersion']=VERSION
 if row.get('img'):
  row.setdefault('prototypeToken',{}).setdefault('texture',{})['src']=row['img']
write('eggman-empire',roster);write('token-art',playable)
print(f'{len(playable)} playable uploads: {inherited} inherited authored profiles, {new} new homebrew profiles; {len(roster)} faction profiles.')
