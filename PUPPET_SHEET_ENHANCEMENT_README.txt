Shinobi no Sho Revamp — Initial Puppet Sheet Enhancement

The puppet actor sheet now provides an individual Roll Attack button for each damaging installed device.

Attack rolls use the assigned controller's Ranged Combat, not the puppet's own character attributes. The roll chat message reports base damage as ceil(Mechanics / 2 + Weapon Damage). Mechanics prerequisites, depleted device charges, and unusable puppets are checked before rolling.

This update preserves the existing Initial Puppet profiles (Offensive, Balanced, Support), device inventory, controller selection, absorption, repair, and resupply functions.

Limitations: Damage application, chakra costs, turn action tracking, and charge spending are not automatic. Use the existing Spend One Use control for limited-use devices.

Updated files:
- module/puppet-sheet.js
- templates/puppet-sheet.hbs

Back up your world before updating and test the puppet sheet in Foundry.
