<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div class="flex gap-5px">
		<div class="width-100-percent">
			<input type="text" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
		</div>
		{{#SVG}}
			{{#isSVG}}
			<div class="abstract_input_svg_icon {{{cssClass}}}" rel="{{{columnName}}}_icon">
				{{{icon}}}
			</div>
			{{/isSVG}}
			{{^isSVG}}
			<div class="abstract_input_img_icon {{{cssClass}}}" rel="{{{columnName}}}_icon">
				<img class="menuImg" src="{{{icon}}}">
			</div>
			{{/isSVG}}
		{{/SVG}}
	</div>
	<div class="flex gap-5px hidden" style="flex-wrap: wrap;" rel="{{{columnName}}}_container"></div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	{{#hasTag}}
	<div class="flex-wrap gap-5px" rel="{{{columnName}}}_tag"></div>
	{{/hasTag}}
</div>