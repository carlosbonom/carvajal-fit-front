export type BlockType = 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'social' | 'html';

export interface EditorBlock {
    id: string;
    type: BlockType;
    content: any;
    styles?: any;
}

export interface NewsletterDesign {
    blocks: EditorBlock[];
    globalStyles?: {
        backgroundColor?: string;
        fontFamily?: string;
    };
}

export interface TextBlockContent {
    text: string;
    fontSize?: number;
    textColor?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface ImageBlockContent {
    url: string;
    alt?: string;
    width?: number;
    link?: string;
}

export interface ButtonBlockContent {
    text: string;
    url: string;
    backgroundColor: string;
    color: string;
    borderRadius?: number;
}

export interface DividerBlockContent {
    padding?: number;
    color?: string;
}

export interface SpacerBlockContent {
    height: number;
    backgroundColor?: string;
}

export interface SocialNetwork {
    network: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'website';
    url: string;
}

export interface SocialBlockContent {
    networks: SocialNetwork[];
    iconStyle: 'circle' | 'rounded' | 'square';
    colorType: 'original' | 'custom';
    customColor?: string;
    align: 'left' | 'center' | 'right';
}

export interface HtmlBlockContent {
    html: string;
}
