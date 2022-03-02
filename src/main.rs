#![feature(derive_default_enum)]

use bevy::{input::system::exit_on_esc_system, prelude::*};
use bevy_inspector_egui::{Inspectable, InspectorPlugin};

mod searcher;

#[derive(Inspectable, Default, Debug)]
enum SelectAlgo {
    AStar,
    #[default]
    Breadth,
    Depth,
    Greedy,
    UniformCost,
}

#[derive(Inspectable, Default, Debug)]
struct Parameters {
    search_type: SelectAlgo,
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugin(InspectorPlugin::<Parameters>::new())
        .add_system(exit_on_esc_system)
        .add_system(display_current_search)
        .add_startup_system(create_entities)
        .insert_resource(ClearColor(Color::rgb(0.0, 0.0, 0.0)))
        .run();
}

fn create_entities(mut cmds: Commands, asset_server: Res<AssetServer>) {
    cmds.spawn_bundle(UiCameraBundle::default());
    cmds.spawn_bundle(TextBundle {
        style: Style {
            align_self: AlignSelf::FlexEnd,
            position_type: PositionType::Absolute,
            position: Rect {
                top: Val::Px(5.0),
                right: Val::Px(15.0),
                ..Default::default()
            },
            ..Default::default()
        },
        text: Text::with_section(
            "Hello, world!",
            TextStyle {
                font: asset_server.load("fonts/ibm_vga.ttf"),
                font_size: 40.0,
                color: Color::WHITE,
            },
            TextAlignment {
                horizontal: HorizontalAlign::Center,
                ..Default::default()
            },
        ),
        ..Default::default()
    });
}

fn display_current_search(mut query: Query<&mut Text>, params: Res<Parameters>) {
    let current_search_text = &mut query.iter_mut().last().unwrap();
    current_search_text.sections[0].value = format!("{:?}", params.search_type);
}
