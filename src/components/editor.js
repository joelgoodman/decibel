// components/Editor.js
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import Embed from "@editorjs/embed";
import LinkTool from "@editorjs/link";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import SimpleImage from "@editorjs/simple-image";
import AttachesTool from "@editorjs/attaches";

const editor = new EditorJS({
	holder: "editorjs",
	tools: {
		header: Header,
		image: {
			class: ImageTool,
			config: {
				endpoints: {
					byFile: "/uploadFile", // Your backend file uploader endpoint
					byUrl: "/fetchUrl", // Your endpoint that provides uploading by URL
				},
			},
		},
		simpleImage: SimpleImage,
		embed: Embed,
		linkTool: LinkTool,
		list: List,
		paragraph: Paragraph,
		attaches: {
			class: AttachesTool,
			config: {
				endpoint: "/uploadFile", // Your backend file uploader endpoint
			},
		},
	},
});

export default editor;
