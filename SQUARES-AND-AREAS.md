# Square distances and attack areas (2.0.39)

STTH 1.5.0 pages 26 and 48–50 describe ranges and movement in squares; each square represents approximately 10 feet. Page 69 distinguishes vehicle firing arcs from splash areas.

## Rulers and movement

New scenes default to grid distance **1**, units **squares**, and equidistant square diagonals. The default diagonal setting is a grid convention, not an implementation of special Velocity Battle costs. Core ruler/path measurements now read in squares on those scenes. Actor Move values already use squares.

Existing scenes retain their current scale. To change one, open Scene Configuration → Grid and set distance to 1 and units to squares. Existing light radii, sight ranges, elevations and other distances expressed in scene units must be converted too: for an old 10-feet-per-square scene, divide those distances by 10 to preserve their physical coverage. The system does not silently rewrite scene lighting or third-party data.

PDF range reference: adjacent = 1 square; Short = 2; Medium = 4; Long = 8; Far = 16. Terrain, height, vehicle turning, Velocity Battles and spending movement on standing/cover remain GM-adjudicated. This update does not automatically move tokens or enforce phase budgets.

## Attack shapes

On an actor sheet, each Signature Attack and Vehicle Weapon has **Arc / Area**:
- **Attack area / splash** previews a single target, cone, line, circle, or rectangle.
- **Firing arc** previews the weapon's Cone, Straight/Line, or 360 targeting arc.
- Set dimensions in squares and choose direction. Native V14 Region placement lets you position the shape and rotate it with the mouse wheel; left-click confirms and Escape cancels.
- Templates are visible scene Regions with no damage or movement behaviors. Remove them with normal Region controls when finished. Scene permissions govern creation.

A Cone arc is a targeting restriction, not necessarily a cone-shaped damaging attack. A Machine Gun with Arc Cone and AoE 3x3 has a cone firing preview and a separate 3x3 area preview, matching page 69. The GM checks the targeted square is in range and inside the firing arc. Splash can extend outside the arc as described in the PDF.

Automatic defaults use explicit AoE dimensions (such as 3x3), then the existing arc. A 360 arc alone defaults to a single-target attack area, not an explosion. Edit the item's **Attack templates (squares)** fields to set shape, preview distance, width, height and cone angle. A template distance of 0 uses the attack range. Unspecified personal range uses Dexterity for ranged attacks or 1 for melee/spin; vehicle weapons with missing range must be set or adjusted in the preview.

The default editable cone angle is 90 degrees as a display convention. The preview is not an automatic ruling on squares hit; match weapon notes and PDF diagrams when positioning. AoE dimensions and firing arcs remain separate.

Templates do not select targets, consume ammunition, spend actions, apply conditions, calculate cover, or multiply damage. Use the existing attack roll and vehicle-squares-hit controls. Height and line of sight remain GM decisions.

Validation: six geometry/default tests passed; modified JavaScript passed syntax checks. Native interactive Region placement has not been tested in a live Foundry session.

API reference: https://foundryvtt.com/api/classes/foundry.canvas.layers.RegionLayer.html
